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

export default function CreateTrans(props) {
  const [message, setMessage] = useState(false);
  const { params } = props.route;
  const { navigation } = props;
  const [visible, setVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [cat, setCat] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showDestinoField, setShowDestinoField] = useState(false);
  const [newPhotoBase64, setNewPhotoBase64] = useState(null);
  const [userid, setUserid] = useState(null);
  const [usernames, setUsernames] = useState([]);

  const getRol = async () => {
    const rolesString = await AsyncStorage.getItem("user");
    const rolesArray = JSON.parse(rolesString);
    setUserid(rolesArray.user.id);
    setUsernames(rolesArray.user.username);
  }
  
  useEffect(() => {
    const initializeUserId = async () => {
      await getRol();
    };
    initializeUserId();
  }, []);
  
  useEffect(() => {
    navigation.setOptions({ title: 'Crear transacción', headerStyle: { backgroundColor: '#3A384A' }, headerTintColor: '#fff', headerShown: true })
  }, []);

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
      setMensj('Error al cargar las categorías');
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
      console.log(error);
      setMensj('Error al cargar las categorías');
      setMessage(true);
      setTimeout(() => {
        setMessage(false);
      }, 2000);
    } finally {
      setVisible(false);
    }
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
          const base64Image = 'data:image/jpeg;base64,' + result.assets[0].base64;
        setNewPhotoBase64(base64Image);
        formik.setFieldValue('comprobante', base64Image);
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

  useEffect(()=> {
      formik.setFieldValue('comprobante', newPhotoBase64);
  }, [newPhotoBase64])

  const formik = useFormik({
    initialValues: {
      nombre: '',
      tipo: '1',
      descripcion: '',
      fecha: changeDate(new Date()),
      categoria: '',
      origen: '',
      destino: 'a',
      monto: '',
      comprobante: newPhotoBase64,
      usuario: {id: userid, username: usernames},
      prestamo: params.prestamo ? params.prestamo : null,
    },
    validationSchema: yup.object({
      nombre: yup.string().required('El nombre es requerido'),
      monto: yup.number().required('El monto es requerido').min(1, 'El monto debe ser mayor a 0'),
      comprobante: yup.string().required('El comprobante es requerido'),
    }),
    onSubmit: async (values) => {
      try {
        setVisible(true);
        const payload = {
          ...values,
          fecha: changeDate(values.fecha),
          tipo: { id: values.tipo },
          categoria: { id: values.categoria },
          origen: { id: values.origen },
          destino: values.tipo === '3' ? { id: values.destino } : undefined,
          usuario: {id: userid, username: usernames},
          monto: values.monto,
          comprobante: newPhotoBase64,
        };

        const response = await AxiosClient({
          url: '/transaccion/',
          method: 'POST',
          data: payload  
        });

        if (response.status === 'OK') {
          setVisible(false);
          navigation.goBack();
        }
      }catch (error) {
        console.log(error);
        setMessage(true);
        setTimeout(() => {
          setMessage(false);
        }, 2000);
      }finally{
        setVisible(false);
      }
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    return `${formattedDay}-${formattedMonth}-${year}`;

  };

  return (
    <ScrollView style={styles.container}>
      <Loading visible={visible} title='Cargando...' />
      <Message visible={message} title='Error. inténtelo más tarde' />
      <Input
        style={styles.description}
        value={formik.values.nombre}
        onChangeText={formik.handleChange('nombre')}
        onBlur={formik.handleBlur('nombre')}
        disabledInputStyle={styles.description}
        label="Nombre"
        labelStyle={{ color: '#ddd' }}
      />

      <Text style={styles.label}>Tipo:</Text>
      <Picker
        selectedValue={formik.values.tipo}
        onValueChange={(value) => handleTipoChange(value)}
        style={styles.picker}
        
      >
        <Picker.Item label="Seleccione un tipo" value="" style={styles.picker}/>
        <Picker.Item label="Ingreso" value="1" style={styles.picker}/>
        <Picker.Item label="Egreso" value="2" style={styles.picker}/>
        {!params.prestamo && <Picker.Item label="Transferencia" value="3" style={styles.picker}/>}
      </Picker>
      <Divider style={{ marginBottom: 20 }} width={1.2} insetType="middle" color='#86939E' />

      <Input
        style={styles.description}
        value={formik.values.descripcion}
        onChangeText={formik.handleChange('descripcion')}
        onBlur={formik.handleBlur('descripcion')}
        label="Descripción"
        disabledInputStyle={styles.description}
        labelStyle={{ color: '#ddd' }}
      />

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

      <Text style={styles.label}>Categoría:</Text>
      <Picker
        selectedValue={formik.values.categoria}
        onValueChange={(itemValue) => formik.setFieldValue('categoria', itemValue)}
        style={styles.picker}

      >
        <Picker.Item label="Seleccione.." value="" style={styles.picker}/>
        {cat.map((categoria, index) => (
          <Picker.Item key={index} label={categoria.nombre} value={categoria.id} style={styles.picker}/>
        ))}
      </Picker>
      <Divider style={{ marginBottom: 20 }} width={1.2} insetType="middle" color='#86939E' />

      <Text style={styles.label}>Cuenta Origen:</Text>
      <Picker
        selectedValue={formik.values.origen}
        onValueChange={(itemValue) => formik.setFieldValue('origen', itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione.." value="" style={styles.picker}/>
        {accounts.map((acc, index) => (
          <Picker.Item key={index} label={acc.nombre} value={acc.id} style={styles.picker}/>
        ))}
      </Picker>
      <Divider style={{ marginBottom: 20 }} width={1.2} insetType="middle" color='#86939E' />

      {showDestinoField && (<><Text style={styles.label}>Cuenta Destino:</Text>
      <Picker
        selectedValue={formik.values.destino}
        onValueChange={(itemValue) => formik.setFieldValue('destino', itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione.." value="" style={styles.picker}/>
        {accounts.map((acc, index) => (
          <Picker.Item key={index} label={acc.nombre} value={acc.id} style={styles.picker}/>
        ))}
      </Picker>
      <Divider style={{ marginBottom: 20 }} width={1.2} insetType="middle" color='#86939E' /></>)}
      

      <Input
        style={styles.description}
        defaultValue={formik.values.monto.toString()}
        onChangeText={formik.handleChange('monto')}
        onBlur={formik.handleBlur('monto')}
        disabledInputStyle={styles.description}
        label="Monto"
        labelStyle={{ color: '#ddd' }}
        keyboardType="numeric"
      />

      <View style={styles.avatarContainer}>
        <Text style={styles.title}>Comprobante:</Text>
        <Avatar
          source={newPhotoBase64 !== null ? { uri: newPhotoBase64 } : { uri: 'https://uifaces.co/our-content/donated/6MWH9Xi_.jpg' }}
          resizeMode='contain'
          containerStyle={styles.avatar}
        >
          <Avatar.Accessory size={30} onPress={changeAvatar} />
        </Avatar>
      </View>

      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
        <Button
          title='Registrar'
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btnStyle}
          titleStyle={{ color: '#fff', marginBottom: 8 }}
          onPress={formik.handleSubmit}
          disabled={formik.isSubmitting || !formik.isValid}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#3A384A'
  },
  row: {
    flexDirection: 'row',
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