import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { useFocusEffect } from '@react-navigation/native';
import { Input, CheckBox, Button, Avatar, Divider } from '@rneui/base';
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

export default function LoanInfo(props) {
    const [message, setMessage] = useState(false);
    const { params } = props.route;
    const { navigation } = props;
    const [visible, setVisible] = useState(false);
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [cat, setCat] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [showDestinoField, setShowDestinoField] = useState(false);
    const [newPhotoBase64, setNewPhotoBase64] = useState(params.loan.transaccion[0].comprobante);
    const [userid, setUserid] = useState(null);     
  const [msg, setMsg] = useState('Error. Inténtelo más tarde');

    const getRol = async () => {
        const rolesString = await AsyncStorage.getItem("user");
        const rolesArray = JSON.parse(rolesString);
        setUserid(rolesArray.user.id);
      }
      useEffect(() => {
        const initializeUserId = async () => {
          await getRol();
        };
        initializeUserId();
      }, []);

    useEffect(() => {
        navigation.setOptions({ title: params.loan.descripcion, headerStyle: { backgroundColor: '#3A384A' }, headerTintColor: '#fff', headerShown: true })
        getRol();
        console.log("user", userid);
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
          if(error.response.status === 400){
            setMsg('No hay cuentas registradas');
          }else{
            setMsg('Error. Inténtelo más tarde');
          }
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
          if(error.response.status === 400){
            setMsg('No hay categorias registradas');
          }else{
            setMsg('Error. Inténtelo más tarde');
          }
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
                    setNewPhotoBase64('data:image/jpeg;base64,' + result.assets[0].base64);
                    formik.setFieldValue('comprobante', newPhotoBase64);
                } catch (error) {
                    console.log(error);
                } finally {
                    setVisible(false);
                }
            }
        } else {
            alert('Es necesario aceptar los permisos de la galería');
        }
    };

    const changeDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString(); // Devuelve en formato ISO 8601
    };

    const formik = useFormik({
        initialValues: {
            id:params.loan.id,
            nombre: params.loan.transaccion[0].nombre,
            categoria: params.loan.transaccion[0].categoria.id,
            tipo: params.loan.tipoPrestamo,
            tipoTr: params.loan.transaccion[0].tipo.id,
            usuario: { id: userid },
            origen: params.loan.transaccion[0].origen.id,
            destino: null,
            monto: params.loan.transaccion[0].monto,
            comprobante: params.loan.transaccion[0].comprobante,
            descripcion: params.loan.transaccion[0].descripcion,
            fecha: params.loan.transaccion[0].fecha,
            interes: params.loan.interes,
            periodo: params.loan.periodo,
            unico: params.loan.unico,
            reembolzado: params.loan.reembolzado,
        },
        validationSchema: yup.object({
            monto: yup.number().required('El monto es requerido'),
        }),
        onSubmit: async (values) => {
            setVisible(true);
            try {
                const payload = {
                    ...values,
                    tipoPrestamo: values.tipo,
                    monto: parseFloat(values.monto),
                    interes: parseFloat(values.interes),
                    periodo: parseInt(values.periodo),
                    unico: values.unico,
                    reembolzado: values.reembolzado,
                    descripcion: values.descripcion,
                    transaccion: {
                        nombre: values.nombre,
                        categoria: { id: values.categoria },
                        descripcion: values.descripcion,
                        tipo: { id: values.tipoTr },
                        usuario: { id: userid },
                        origen: { id: values.origen },
                        status: true,
                        monto: parseFloat(values.monto),
                        comprobante: newPhotoBase64,
                    },
                    usuario: { id: userid },
                }
                if (values.tipo === 'true') {
                    payload.transaccion.tipo = { id: 1 };
                } else {
                    payload.transaccion.tipo = { id: 2 };
                }
                const response = await AxiosClient({
                    url: '/prestamo/'+ values.id,
                    method: 'PUT',
                    data: payload
                });

                if (response.status === 'OK') {
                    navigation.navigate('Préstamos');
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
        const tipoCat = value === 'true' ? 1 : 2;
        getCat(value, userid);
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

    return (
        <ScrollView style={styles.container}>
            <Loading visible={visible} title='Cargando...' />
        <Message visible={message} title={msg} />

            {params.edit ? (
                <>
                    <Text style={styles.label}>Tipo:</Text>
                    <Picker
                        selectedValue={formik.values.tipo}
                        onValueChange={(value) => handleTipoChange(value)}
                        style={styles.picker}

                    >
                        <Picker.Item label="Solicitar Préstamo" value={true} style={styles.picker} />
                        <Picker.Item label="Dar préstamo" value={false} style={styles.picker} />
                    </Picker>
                    <Divider style={{ marginBottom: 20 }} width={1.2} insetType="middle" color='#86939E' />
                </>
            ) : (
                <View style={styles.row}>
                    <Text style={styles.title}>{formik.values.tipo ? 'Préstamo Solicitado' : 'Préstamo Dado'}</Text>
                </View>
            )}

            {params.edit ? (
                <Input
                    style={styles.description}
                    defaultValue={formik.values.monto ? formik.values.monto.toString() : ''}
                    onChangeText={formik.handleChange('monto')}
                    onBlur={formik.handleBlur('monto')}
                    disabledInputStyle={styles.description}
                    label="Monto"
                    labelStyle={{ color: '#ddd' }}
                    keyboardType="numeric"
                />
            ) : (
                <View style={styles.row}>
                    <Text style={styles.title}>Monto:</Text>
                    <Text style={styles.description}>$ {params.loan.transaccion[0].monto}</Text>
                </View>
            )}
            {params.edit ? (
                <Input
                    style={styles.description}
                    defaultValue={formik.values.interes ? formik.values.interes.toString() : ''}
                    onChangeText={formik.handleChange('interes')}
                    onBlur={formik.handleBlur('interes')}
                    disabledInputStyle={styles.description}
                    label="Interés"
                    labelStyle={{ color: '#ddd' }}
                    keyboardType="numeric"
                />
            ) : (params.loan.interes &&
                <View style={styles.row}>
                    <Text style={styles.title}>Interés:</Text>
                    <Text style={styles.description}>{params.loan.interes} %</Text>
                </View>
            )}

            {params.edit ? (
                <View>
                    <Text style={styles.label}>Pago único?</Text>
                    <CheckBox
                        size={20}
                        center
                        checked={formik.values.unico}
                        onPress={() => formik.setFieldValue('unico', !formik.values.unico)}
                        containerStyle={{ backgroundColor: '#3A384A', width: "5%" }} />
                </View>
            ) : (
                <View style={styles.row}>
                    <Text style={styles.title}>{formik.values.unico === true ? 'Pago único' : `Pago en ${params.loan.periodo} meses`}</Text>
                </View>
            )}

            {params.edit ? (
                formik.values.unico ? null :
                    <Input
                        style={styles.description}
                        defaultValue={formik.values.periodo ? formik.values.periodo.toString() : ''}
                        onChangeText={formik.handleChange('periodo')}
                        onBlur={formik.handleBlur('periodo')}
                        disabledInputStyle={styles.description}
                        label="Periodo (Meses)"
                        labelStyle={{ color: '#ddd' }}
                        keyboardType="numeric"
                    />
            ) : (null
            )}

            {params.edit ? (
                <Input
                    style={styles.description}
                    value={formik.values.nombre}
                    onChangeText={formik.handleChange('nombre')}
                    onBlur={formik.handleBlur('nombre')}
                    disabledInputStyle={styles.description}
                    label="Nombre"
                    labelStyle={{ color: '#ddd' }}
                />
            ) : (
                <View style={styles.row}>
                    <Text style={styles.title}>Nombre: </Text>
                    <Text style={styles.description}>{params.loan.transaccion[0].nombre}</Text>
                </View>
            )}

            {params.edit ? (
                <Input
                    style={styles.description}
                    value={formik.values.descripcion}
                    onChangeText={formik.handleChange('descripcion')}
                    onBlur={formik.handleBlur('descripcion')}
                    label="Descripción"
                    disabledInputStyle={styles.description}
                    labelStyle={{ color: '#ddd' }}
                />
            ) : (
                <View style={styles.row}>
                    <Text style={styles.title}>Descripción: </Text>
                    <Text style={styles.description}>{params.loan.transaccion[0].descripcion}</Text>
                </View>
            )}

            {params.edit ? (
                <>
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
            ) : (
                <View style={styles.row}>
                    <Text style={styles.title}>Categoría: </Text>
                    <Text style={styles.description}>{params.loan.transaccion[0].categoria.nombre}</Text>
                </View>
            )}

            {params.edit ? (
                <>
                    <Text style={styles.label}>Cuenta:</Text>
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
            ) : (
                <View style={styles.row}>
                    <Text style={styles.title}>Cuenta: </Text>
                    <Text style={styles.description}>{params.loan.transaccion[0].origen.nombre}</Text>
                </View>
            )}
            <View style={styles.avatarContainer}>
                <Text style={styles.title}>Comprobante:</Text>
                {params.loan.transaccion[0].comprobante && params.loan.transaccion[0].comprobante.length > 0 ? (
                    <Avatar
                        source={{ uri: newPhotoBase64 }}
                        resizeMode='contain'
                        containerStyle={styles.avatar}
                    >
                        {params.edit && <Avatar.Accessory size={30} onPress={changeAvatar} />}
                    </Avatar>
                ) : (
                    <Avatar
                        source={{ uri: "https://cdn-icons-png.flaticon.com/512/987/987815.png" }}
                        resizeMode='contain'
                        containerStyle={styles.avatar}
                    />
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