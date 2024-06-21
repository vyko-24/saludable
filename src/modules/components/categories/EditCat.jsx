import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { Input, ListItem, Button, Divider } from '@rneui/base';
import { Picker } from '@react-native-picker/picker';
import AxiosClient from '../../../config/http-gateway/http-client';
import * as yup from 'yup';
import { useFormik, } from 'formik';
import Loading from '../../../kernel/Loading';
import Message from '../../../kernel/Message';

export default function EditCat(props) {
  const [message, setMessage] = useState(false);
  const { params } = props.route;
  const { navigation } = props;
  const [usuarios, setUsuarios] = useState([]);
  const [visible, setVisible] = useState(false);

  const [checked, setChecked] = useState({});


  const getUsuarios = async () => {
    setVisible(true);
    try {
      const response = await AxiosClient({
        url: '/usuario/',
        method: 'GET'
      })
      if (response.status === 'OK') {
        setUsuarios(response.data)
        setVisible(false);
      }
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
  const id = params.category.id;

  useEffect(() => {
    navigation.setOptions({ title: params.category.nombre, headerStyle: { backgroundColor: '#3A384A' }, headerTintColor: '#fff', headerShown: true })
    getUsuarios();
  }, []);
  

  useEffect(() => {
    const initialChecked = usuarios.reduce((acc, usuario) => {
      acc[usuario.id] = params.category.usuario.some((user) => user.username === usuario.username);
      return acc;
    }, {});
    setChecked(initialChecked);
  }, [usuarios, params.edit, params.user]);

  const toggleCheckbox = (permisoId) => {
    setChecked(prevChecked => ({
      ...prevChecked,
      [permisoId]: !prevChecked[permisoId]
    }));
  };

  const formik = useFormik({
    initialValues: {
      id:params.category.id,
      tipo:params.category.tipo.id.toString(),
      nombre:params.category.nombre,
      presupuesto:params.category.presupuesto,
      usuario:params.category.usuario,
      parent: params.category.parent
    },
    validationSchema: yup.object({
      nombre: yup.string().required('El nombre es requerido'),
    }),
    onSubmit: async (values) => {
      try {
        setVisible(true);
        const users = Object.keys(checked).filter((key) => checked[key]).map(id => ({ id }));
        const payload = {
          nombre: values.nombre,
          parent: values.parent,
          presupuesto: values.presupuesto,
          tipo: { id: values.tipo },
          usuario: users,
        }
        if (!values.parent){ 
          delete payload.parent
        };
        console.log(payload);

        const response = await AxiosClient({
          url: '/categoria/' + values.id,
          method: 'PUT',
          data: payload
        })
        console.log(response);
        if (response.status === 'OK') {
            navigation.navigate('Categorías');
        }
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

  const handleTipoChange = (value) => {
    formik.setFieldValue('tipo', value);
  };

  return (
    <ScrollView style={styles.container}>
    <Loading
        visible={visible}
        title='Cargando...'
    />
    <Message visible={message} title='Error. inténtelo más tarde' />
      <Input
        style={styles.description}
        value={formik.values.nombre}
        onChangeText={formik.handleChange('nombre')}
        onBlur={formik.handleBlur('nombre')}
        disabledInputStyle={styles.description}
        label="Nombre"
      />
      <Input
        style={styles.description}
        defaultValue={formik.values.presupuesto.toString()}
        onChangeText={formik.handleChange('presupuesto')}
        onBlur={formik.handleBlur('presupuesto')}
        label="Presupuesto"
        keyboardType="numeric"
      />
      
      <Text style={styles.label}>Tipo:</Text>
          <Picker
            selectedValue={formik.values.tipo}
            onValueChange={(value) => handleTipoChange(value)}
            style={styles.picker}
          >
            <Picker.Item label="Ingreso" value={1} style={styles.picker}/>
            <Picker.Item label="Egreso" value={2} style={styles.picker}/>
            <Picker.Item label="Transferencia" value={3} style={styles.picker} />
          </Picker>
          <Divider style={{ marginBottom: 20 }} width={1.2} insetType="middle" color='#86939E' />
      {params.admin && (
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.label}>Usuarios con Acceso</Text>

          {usuarios.filter(user => user.id !== 1).map((user, index) => (
            <ListItem key={user.id} bottomDivider containerStyle={{ backgroundColor: '#3A384A' }}>
              <ListItem.CheckBox
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                center
                checked={checked[user.id]}
                onPress={() => toggleCheckbox(user.id)}
                containerStyle={{ backgroundColor: '#3A384A' }}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.description}>{user.username}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))}
        </View>
      )}
      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
        <Button
          title='Actualizar'
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
  picker: {
    flex: 1,
    color: '#ddd',
    backgroundColor: '#3A384A',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  btnContainer: {
    width: '80%',

  },
  label: {
    color: '#ddd',
    fontSize: 16,
    marginStart: 8,
    fontWeight: 'bold',
  },
})