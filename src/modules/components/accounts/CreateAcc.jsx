import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { Input, ListItem, Button, Avatar, Divider } from '@rneui/base';
import AxiosClient from '../../../config/http-gateway/http-client';
import * as yup from 'yup';
import { useFormik } from 'formik';
import Loading from '../../../kernel/Loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Message from '../../../kernel/Message';

export default function CreateAcc(props) {
  const [message, setMessage] = useState(false);
  const { params } = props.route;
  const { navigation } = props;
  const [visible, setVisible] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [checked, setChecked] = useState({});
  const [userid, setUserid] = useState(0);

  const getRol = async () => {
    const rolesString = await AsyncStorage.getItem("user");
    const rolesArray = JSON.parse(rolesString);
    setUserid(rolesArray.user.id);
  }

  useEffect(() => {
    navigation.setOptions({ title: 'Crear cuenta', headerStyle: { backgroundColor: '#3A384A' }, headerTintColor: '#fff', headerShown: true })
    getUsuarios();
    getRol();
  }, []);

  console.log(params.selectedGroup);
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

  const toggleCheckbox = (userID) => {
    setChecked(prevChecked => ({
      ...prevChecked,
      [userID]: !prevChecked[userID]
    }));
  };

  const formik = useFormik({
    initialValues: {
      nombre: '',
      saldo: '',
    },
    validationSchema: yup.object({
      nombre: yup.string().required('El nombre es requerido'),
      saldo: yup.number().required('El saldo es requerido'),
    }),
    onSubmit: async (values) => {
      setVisible(true);
      const supervisor = Object.keys(checked).filter((key) => checked[key]).map(id => ({ id }));
      try {
        const payload = params.admin
          ? params.gr
            ? {
              ...values,
              nombre: values.nombre,
              saldo: values.saldo,
              supervisor: supervisor,
              grupo: params.selectedGroup
            }
            : {
              ...values,
              nombre: values.nombre,
              saldo: values.saldo,
              supervisor: supervisor
            }
          : {
            ...values,
            nombre: values.nombre,
            saldo: values.saldo,
            supervisor: { id: userid }
          };
        const response = await AxiosClient({
          url: '/cuenta/',
          method: 'POST',
          data: payload
        })
        if (response.status === 'OK') {
          setVisible(false);
          navigation.navigate('Cuentas');
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

  return (
    <ScrollView style={styles.container}>
      <Loading visible={visible} title='Cargando...' />
      <Message visible={message} title='Error. Inténtelo más tarde' />

      <Input
        label='Nombre'
        value={formik.values.nombre}
        onChangeText={formik.handleChange('nombre')}
        onBlur={formik.handleBlur('nombre')}
        style={styles.description}
        error={formik.touched.nombre && formik.errors.nombre}
      />

      <Input
        label='Saldo'
        value={formik.values.saldo.toString()}
        onChangeText={formik.handleChange('saldo')}
        onBlur={formik.handleBlur('saldo')}
        style={styles.description}
        error={formik.touched.saldo && formik.errors.saldo}
        keyboardType="numeric"
      />

      {params.admin && (
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.label}>Usuarios con Acceso</Text>

         { usuarios.filter(user => user.id !== 1).map((user, index) => (
          <ListItem key={user.id} bottomDivider containerStyle={{ backgroundColor: '#3A384A' }}>
            <ListItem.CheckBox
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              center
              checked={checked[user.id]}
              onPress={() => toggleCheckbox(user.id)}
              containerStyle={{ backgroundColor: '#3A384A'}}
            />
            <ListItem.Content>
              <ListItem.Title style={styles.description}>{user.username}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
        </View>
      )}

      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 30  }}>
        <Button
          title='Registrar'
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btnStyle}
          titleStyle={{ color: '#fff', marginBottom: 8 }}
          onPress={formik.handleSubmit}
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