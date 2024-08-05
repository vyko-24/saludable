import { StyleSheet, Text, View } from 'react-native'
import React,{useEffect, useState} from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import AxiosClient from '../../../config/http-gateway/http-client';
import { Input, Button, Icon, ListItem } from '@rneui/base';
import * as yup from 'yup';
import { useFormik } from 'formik';
import Loading from '../../../kernel/Loading';
import Message from '../../../kernel/Message';

export default function CreateUser(props) {
  const [message, setMessage] = useState(false);
  const { navigation } = props;
  const [permisos, setPermisos] = useState([]);
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState({});
  const [showPassword, setShowPassword] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: 'Crear usuario', headerStyle: { backgroundColor: '#3A384A' }, headerTintColor: '#fff', headerShown: true })
    getPermisos();
  }, []);

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
      username: '',
      email: '',
      password:'',
      confirm:'',
    },
    validationSchema: yup.object({
      username: yup.string().required('El nombre de usuario es requerido'),
      email: yup.string().email('El correo electrónico no es válido').required('El correo electrónico es requerido'),
      password: yup.string().required('La contraseña es requerida').max(50, "Solo se permiten hasta 50 caractéres").min(8, "Mínimo 8 caractéres"),
      confirm: yup.string().required('La confirmación de la contraseña es requerida').oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden'),
    }),
    onSubmit: async (values) => {
      const roles = Object.keys(checked).filter((key) => checked[key]).map((key) => ({ id: key }));
      const payload = {
        ...values,
        roles:roles
      }
      try {
        setVisible(true);
        const response = await AxiosClient({
          url: '/usuario/',
          method: 'POST',
          data:payload,
        });
        console.log(response);
        console.log(payload);
        if (response.status === 'OK') {
          setVisible(false);
          navigation.goBack();
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
    <Message visible={message} title='Error. inténtelo más tarde' />
      <View style={styles.row}>
        <Text style={styles.title}>Nombre de usuario:</Text>
          <Input
            style={styles.description}
            value={formik.values.username}
            onChangeText={formik.handleChange('username')}
            onBlur={formik.handleBlur('username')}
            disabledInputStyle={styles.description}
          />
      </View>
      <View style={styles.row}>
        <Text style={styles.title}>Correo electrónico:</Text>
          <Input
            style={styles.description}
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            disabledInputStyle={styles.description}
          />
      </View>
      <View style={styles.row}>
        <Text style={styles.title}>Contraseña:</Text>
          <Input
            style={styles.description}
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            disabledInputStyle={styles.description}
            secureTextEntry={showPassword}
            leftIcon={
                <Icon
                    type="material-community"
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    color='white'
                    onPress={() => setShowPassword(!showPassword)}
                />
            }
          />
      </View>
      <View style={styles.row}>
        <Text style={styles.title}>Confirmar contraseña:</Text>
          <Input
            style={styles.description}
            value={formik.values.confirm}
            onChangeText={formik.handleChange('confirm')}
            onBlur={formik.handleBlur('confirm')}
            disabledInputStyle={styles.description}
            secureTextEntry={showPassword}
            leftIcon={
                <Icon
                    type="material-community"
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    color='white'
                    onPress={() => setShowPassword(!showPassword)}
                />
            }
          />
      </View>
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.title}>Permisos:</Text>
        {permisos.filter(permiso => permiso.name !== 'ADMIN').map((permiso, index) => (
            <ListItem key={permiso.id} bottomDivider containerStyle={{ backgroundColor: '#3A384A' }}>
              <ListItem.CheckBox
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                center
                checked={checked[permiso.id]}
                onPress={() => toggleCheckbox(permiso.id)}
                containerStyle={{ backgroundColor: '#3A384A' }}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.description}>{permiso.name}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))}
      </View>
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
    color: 'white',
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