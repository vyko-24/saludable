import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { useFocusEffect } from '@react-navigation/native';
import { Input, ListItem, Button, Avatar, Divider } from '@rneui/base';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import AxiosClient from '../../../config/http-gateway/http-client';
import * as yup from 'yup';
import { useFormik, FormikProvider } from 'formik';
import Loading from '../../../kernel/Loading';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Message from '../../../kernel/Message'

export default function TransInfo(props) {
  const { params } = props.route;
  const { navigation } = props;
  const [visible, setVisible] = useState(false);
  const [date, setDate] = useState(new Date(params.transaction.fecha));
  const [show, setShow] = useState(false);
  const [cat, setCat] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showDestinoField, setShowDestinoField] = useState(false);
  const [newPhotoBase64, setNewPhotoBase64] = useState(params.transaction.comprobante);
  const [userid, setUserid] = useState(null);
  const [message, setMessage] = useState(false);
  const [mensj, setMensj] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: params.transaction.nombre, headerStyle: { backgroundColor: '#3A384A' }, headerTintColor: '#fff', headerShown: true })
  }, []);

  const getRol = async () => {
    const rolesString = await AsyncStorage.getItem("user");
    const rolesArray = JSON.parse(rolesString);
    setUserid(rolesArray.user.id);
  }


  const getAcc = async (userid) => {
    try {
      if (params.admin) {
        const response = await AxiosClient({
          url: '/cuenta/',
          method: 'GET'
        })
        if (response.status === 'OK') {
          setAccounts(response.data)
        }
      } else {
        const response = await AxiosClient({
          url: '/cuenta/supervisor/' + userid,
          method: 'GET'
        })
        if (response.status === 'OK') {
          setAccounts(response.data)
        }
      }
    } catch (error) {
      console.log(error);
      if(error.response.status === 400){
        setMensj('No hay cuentas registradas');
      }else{
        setMensj('Error. Inténtelo más tarde');
      }
      setMessage(true);
      setTimeout(() => {
        setMessage(false);
      }, 2000);
    } finally {
      setVisible(false);
    }
  }

  const getCat = async (tipo, userid) => {
    console.log('tipo', tipo);
    console.log('userid', userid);
    if (!tipo) tipo = 1;
    console.log('tipo', tipo);
    try {
      if (params.admin) {
        console.log('admin');
        const response = await AxiosClient({
          url: '/categoria/tipo/' + tipo,
          method: 'GET'
        });
        if (response.status === 'OK') {
          setCat(response.data);
        }
      } else {
        console.log('no admin');
        const response = await AxiosClient({
          method: 'GET',
          url: '/categoria/coso/' + tipo + '/' + userid
        })

        if (response.status === 'OK') {
          setCat(response.data);
        }
      }
    } catch (error) {
      console.log(error);if(error.response.status === 400){
        setMensj('No hay categorías registradas');
      }else{
        setMensj('Error. Inténtelo más tarde');
      }
      setMessage(true);
      setTimeout(() => {
        setMessage(false);
      }, 2000);
    } finally {
      setVisible(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    return `${formattedDay}-${formattedMonth}-${year}`;

  };

  const changeAvatar = async () => {
    const resultPermission = await MediaLibrary.requestPermissionsAsync();
    if (resultPermission.status !== 'denied') {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [3, 5],
        quality: 1,
        base64: true
      });
      if (!result.canceled) {
        setVisible(true);
        try {
          setNewPhotoBase64('data:image/jpeg;base64,' + result.assets[0].base64);
          formik.setFieldValue('comprobante', newPhotoBase64);
        } catch (error) {
          console.log(error);
          setMessage(true);
          setTimeout(() => {
            setMessage(false);
          }, 2000);
        } finally {
          setVisible(false);
        }
      }
    } else {
      alert('Es necesario aceptar los permisos de la galería');
    }
  };

  const handleTipoChange = (value) => {
    formik.setFieldValue('tipo', value);
    if (value === '3') {
      setShowDestinoField(true);
    } else {
      setShowDestinoField(false);
    }
    getCat(value, userid);
  };

  const changeDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString(); // Devuelve en formato ISO 8601
  };

  useEffect(() => {
    const initializeUserId = async () => {
      await getRol();
    };
    initializeUserId();
  }, []);

  useEffect(() => {
    if (userid) {
      getAcc(userid);
      getCat(0, userid);
    }
  }, [userid]);

  useFocusEffect(
    useCallback(() => {
      if (userid) {
        getAcc(userid);
        getCat(0, userid);
      }
    }, [userid])
  );

  const formik = useFormik({
    initialValues: {
      id: params.transaction.id,
      nombre: params.transaction.nombre,
      descripcion: params.transaction.descripcion,
      fecha: params.transaction.fecha,
      tipo: params.transaction.tipo.id.toString(),
      categoria: params.transaction.categoria.id,
      origen: params.transaction.origen.id,
      destino: params.transaction.destino ? params.transaction.destino.id : 'a',
      monto: params.transaction.monto,
      comprobante: params.transaction.comprobante,
      usuario: params.transaction.usuario.id,
      prestamo: params.transaction.prestamo ? params.transaction.prestamo : null,
    },
    validationSchema: yup.object({
      nombre: yup.string().required('El nombre es requerido'),
      fecha: yup.date().required('La fecha es requerida'),
      categoria: yup.string().required('La categoría es requerida'),
      origen: yup.string().required('La cuenta de origen es requerida'),
      destino: yup.string(),
      monto: yup.number().required('El monto es requerido'),
      comprobante: yup.string(),
      usuario: yup.string().required('El usuario es requerido'),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          fecha: changeDate(values.fecha),
          tipo: { id: values.tipo },
          categoria: { id: values.categoria },
          origen: { id: values.origen },
          destino: { id: values.destino },
          usuario: { id: values.usuario },
          monto: values.monto,
          comprobante: newPhotoBase64,
        }
        // Verificar si se ha proporcionado un destino
        if (payload.destino.id === 'a') {
          delete payload.destino; // Eliminar destino del payload si no se ha proporcionado
        }
        setVisible(true);
        const response = await AxiosClient({
          method: 'PUT',
          url: '/transaccion/' + values.id,
          data: payload
        });
        if (response.status === 'OK') {
          navigation.navigate('Transacciones');
        }
        setVisible(false);
      } catch (error) {
        console.log(error);
        setMessage(true);
        setTimeout(() => {
          setMessage(false);
        }, 2000);
      } finally {
        setVisible(false);
      }
    }
  });

  return (
    <ScrollView style={styles.container}>
      <Message visible={message} title={mensj} />
      <Loading visible={visible} title='Cargando...' />
      {params.edit ? (
        <Input
          style={styles.description}
          value={formik.values.nombre}
          onChangeText={formik.handleChange('nombre')}
          onBlur={formik.handleBlur('nombre')}
          disabled={!params.edit}
          disabledInputStyle={styles.description}
          label="Nombre"
          labelStyle={{ color: '#ddd' }}
        />
      ) : (
        <View style={styles.row}>
          <Text style={styles.title}>Nombre:</Text>
          <Text style={styles.description}>{params.transaction.nombre}</Text>
        </View>
      )}


      {params.edit ? (
        <>
          <Text style={styles.label}>Tipo:</Text>
          <Picker
            selectedValue={formik.values.tipo}
            onValueChange={(value) => handleTipoChange(value)}
            style={styles.picker}
          >
            <Picker.Item label="Ingreso" value="1" style={styles.picker} />
            <Picker.Item label="Egreso" value="2" style={styles.picker} />
            <Picker.Item label="Transferencia" value="3" style={styles.picker} />
          </Picker>
          <Divider style={{ marginBottom: 20 }} width={1.2} insetType="middle" color='#86939E' />
        </>
      ) : (
        <View style={styles.row}>
          <Text style={styles.title}>Tipo:</Text>
          <Text style={styles.description}>{params.transaction.tipo.nombre}</Text>
        </View>
      )}

      {params.edit ? (
        <Input
          style={styles.description}
          value={formik.values.descripcion}
          onChangeText={formik.handleChange('descripcion')}
          onBlur={formik.handleBlur('descripcion')}
          disabled={!params.edit}
          label="Descripción"
          disabledInputStyle={styles.description}
          labelStyle={{ color: '#ddd' }}
        />
      ) : (
        <View style={styles.row}>
          <Text style={styles.title}>Descripción:</Text>
          <Text style={styles.description}>{params.transaction.descripcion}</Text>
        </View>
      )}

      {params.edit ? (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Fecha:</Text>
          <Button onPress={() => setShow(true)} title={formatDate(formik.values.fecha)} />
          {show && <DateTimePicker
            value={date}
            mode="date"
            format="YYYY-MM-DD"  // Asegura que el formato sea YYYY-MM-DD
            onDateChange={(date) => {
              setShow(false);
              setDate(date);
              formik.setFieldValue('fecha', date.toISOString());  // Almacena en formato ISO 8601
            }}
          />}
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <Text style={styles.title}>Fecha:</Text>
            <Text style={styles.description}>{formatDate(params.transaction.fecha)}</Text>
          </View>
        </>
      )}

      {params.edit ? (<>
        <Text style={styles.label}>Categoría:</Text>
        <Picker
          selectedValue={formik.values.categoria}
          onValueChange={(itemValue) => formik.setFieldValue('categoria', itemValue)}
          style={styles.picker}

        >
          {cat.map((categoria, index) => (
            <Picker.Item key={index} label={categoria.nombre} value={categoria.id} style={styles.picker} />
          ))}
        </Picker>
        <Divider style={{ marginBottom: 20 }} width={1.2} insetType="middle" color='#86939E' />
      </>
      ) :
        (<View style={styles.row}>
          <Text style={styles.title}>Categoría:</Text>
          <Text style={styles.description}>{params.transaction.categoria.nombre}</Text>
        </View>)}

      {params.edit ? (
        <>
          <Text style={styles.label}>Cuenta Origen:</Text>
          <Picker
            selectedValue={formik.values.origen}
            onValueChange={(itemValue) => formik.setFieldValue('origen', itemValue)}
            style={styles.picker}
          >
            {accounts.map((acc, index) => (
              <Picker.Item key={index} label={acc.nombre} value={acc.id} style={styles.picker} />
            ))}
          </Picker>
          <Divider style={{ marginBottom: 20 }} width={1.2} insetType="middle" color='#86939E' />
        </>
      ) :
        (<View style={styles.row}>
          <Text style={styles.title}>Cuenta Origen:</Text>
          <Text style={styles.description}>{params.transaction.origen.nombre}</Text>
        </View>)}

      {params.transaction.destino || showDestinoField ? (
        params.edit ? (
          <>
            <Text style={styles.label}>Cuenta Destino:</Text>
            <Picker
              selectedValue={formik.values.destino}
              onValueChange={(itemValue) => formik.setFieldValue('destino', itemValue)}
              style={styles.picker}
            >
              {accounts.map((acc, index) => (
                <Picker.Item key={index} label={acc.nombre} value={acc.id} style={styles.picker} />
              ))}
            </Picker>
            <Divider style={{ marginBottom: 20 }} width={1.2} insetType="middle" color='#86939E' />
          </>
        ) : (
          <View style={styles.row}>
            <Text style={styles.title}>Cuenta Destino:</Text>
            <Text style={styles.description}>{params.transaction.destino.nombre}</Text>
          </View>
        )
      ) : null}


      {params.edit ? (
        <Input
          style={styles.description}
          defaultValue={formik.values.monto.toString()}
          onChangeText={formik.handleChange('monto')}
          onBlur={formik.handleBlur('monto')}
          disabled={!params.edit}
          disabledInputStyle={styles.description}
          label="Monto"
          labelStyle={{ color: '#ddd' }}
          keyboardType="numeric"
        />
      ) : (<View style={styles.row}>
        <Text style={styles.title}>Monto:</Text>
        <Text style={styles.description}>$ {params.transaction.monto}</Text>
      </View>)}


      {params.admin && (
        <View style={styles.row}>
          <Text style={styles.title}>Usuario:</Text>
          <Text style={styles.description}>{params.transaction.usuario.username}</Text>
        </View>
      )}


      <View style={styles.avatarContainer}>
        <Text style={styles.title}>Comprobante:</Text>
        {params.transaction.comprobante && params.transaction.comprobante.length > 0 ? (
          <Avatar
            source={{ uri: newPhotoBase64 }}
            resizeMode='contain'
            containerStyle={styles.avatar}
          >
            {params.edit && <Avatar.Accessory size={30} onPress={changeAvatar} />}
          </Avatar>
        ) : (
          <Text style={{color:'white', fontSize:10}}>Sin comprobante</Text>
        )}
      </View>

      {params.edit && (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
          <Button
            title='Actualizar'
            containerStyle={styles.btnContainer}
            buttonStyle={styles.btnStyle}
            titleStyle={{ color: '#fff', marginBottom: 8 }}
            onPress={formik.handleSubmit}
          />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3A384A'
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    color: '#ddd',
    fontSize: 18,
    paddingHorizontal: 16,
  },
  btnStyle: {
    backgroundColor: '#0D6EFD',
    color: 'white',

  },
  btnContainer: {
    width: '80%',

  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingBottom: 20,
  },
  avatar: {
    width: 300,
    height: 400,
    borderRadius: 115,
  },
  picker: {
    flex: 1,
    color: '#ddd',
    backgroundColor: '#3A384A',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    color: '#ddd',
    fontSize: 16,
    marginStart: 8,
    fontWeight: 'bold',
  },
})