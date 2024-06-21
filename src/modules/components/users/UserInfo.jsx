import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { Input, ListItem, Button } from '@rneui/base';
import AxiosClient from '../../../config/http-gateway/http-client';
import * as yup from 'yup';
import { useFormik, FormikProvider } from 'formik';
import Loading from '../../../kernel/Loading';
import Message from '../../../kernel/Message';

export default function UserInfo(props) {
  const [message, setMessage] = useState(false);
  const { params } = props.route;
  const { navigation } = props;
  const [permisos, setPermisos] = useState([]);
  const [visible, setVisible] = useState(false);

  const [checked, setChecked] = useState({});

  useEffect(() => {
    navigation.setOptions({ title: 'Información del usuario', headerStyle: { backgroundColor: '#3A384A' }, headerTintColor: '#fff', headerShown: true })
    getPermisos();
  }, []);

  useEffect(() => {
    if (params.edit) {
      const initialChecked = permisos.reduce((acc, permiso) => {
        acc[permiso.id] = params.user.roles.some((role) => role.name === permiso.name);
        return acc;
      }, {});
      setChecked(initialChecked);
    }
  }, [permisos, params.edit, params.user]);

  const getPermisos = async () => {
    setVisible(true);
    try {
      const response = await AxiosClient({
        url: '/role/',
        method: 'GET'
      })
      if (response.status === 'OK') {
        setPermisos(response.data)
        setVisible(false);
      }
    } catch (error) {
      console.log(error);
      setMessage(true);
      setTimeout(() => {
        setMessage(false);
      }, 2000);
    }finally{
      setVisible(false);
    }
  }

  const toggleCheckbox = (permisoId) => {
    setChecked(prevChecked => ({
      ...prevChecked,
      [permisoId]: !prevChecked[permisoId]
    }));
  };

  const formik = useFormik({
    initialValues: {
      id: params.user.id,
      username: params.user.username,
      email: params.user.email,
      password:params.user.password,
    },
    validationSchema: yup.object({
      username: yup.string().required('Campo requerido'),
      email: yup.string().email('Correo electrónico inválido').required('Campo requerido'),
    }),
    onSubmit: async (values) => {
      const roles = Object.keys(checked).filter((key) => checked[key]).map(id => ({ id }));
      const payload = {
        ...values,
        username: values.username,
        email: values.email,
        password:params.user.password,
        roles: roles
      }
      console.log(payload);
      try {
        setVisible(true);
        const response = await AxiosClient({
          url: `/usuario/${params.user.id}`,
          method: 'PUT',
          data: payload
        });
        console.log(response);
        if (response.status === 'OK') {
          setVisible(false);
          console.log(response.data);
          navigation.navigate('Usuarios');
        }
      } catch (error) {
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

  return (
    <ScrollView style={styles.container}>
    <Loading
        visible={visible}
        title='Cargando...'
    />
    <Message visible={message} title='Error. Inténtelo más tarde'/>
        {!params.edit ? (
      <View style={styles.row}>
        <Text style={styles.title}>Nombre de usuario:</Text>
          <Text style={styles.description}>{params.user.username}</Text>
          </View>
        ) : (
          <Input
            style={styles.description}
            value={formik.values.username}
            onChangeText={formik.handleChange('username')}
            onBlur={formik.handleBlur('username')}
            disabled={!params.edit}
            disabledInputStyle={styles.description}
            label="Nombre de usuario"
          />
        )}
        {!params.edit ? (
      <View style={styles.row}>
        <Text style={styles.title}>Correo electrónico:</Text>
          <Text style={styles.description}>{params.user.email}</Text>
          </View>
        ) : (
          <Input
            style={styles.description}
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            disabled={!params.edit}
            label="Correo electrónico"
            disabledInputStyle={styles.description}
          />
        )}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.title}>Permisos:</Text>
        {params.edit ? (
          permisos.filter(permiso => permiso.name !== 'ADMIN').map((permiso, index) => (
            <ListItem key={permiso.id} bottomDivider containerStyle={{ backgroundColor: '#3A384A' }}>
              <ListItem.CheckBox
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                center
                checked={checked[permiso.id]}
                onPress={() => toggleCheckbox(permiso.id)}
                containerStyle={{ backgroundColor: '#3A384A'}}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.description}>{permiso.name}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))
        ) : (
          params.user.roles.length === 0 ? (<Text style={styles.description}>- Sin permisos</Text>) :
            (params.user.roles.map((role, index) => (
              <Text key={index} style={styles.description}>- {role.name}</Text>)
            ))
        )}
      </View>
      {params.edit &&(<View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 30  }}>
        <Button
          title='Actualizar'
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btnStyle}
          titleStyle={{ color: '#fff', marginBottom: 8 }}
          onPress={formik.handleSubmit}
        />
      </View>)}
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

  }
})