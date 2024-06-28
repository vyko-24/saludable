import { StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { Input, Button, Icon } from '@rneui/base'
import Loading from '../../kernel/Loading'
import AxiosClient from '../../config/http-gateway/http-client'
import AuthContext from '../../config/context/auth-context'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Message from '../../kernel/Message'
import * as Device from 'expo-device';


export default function Login() {
    const { user, dispatch } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(true);
    const [showMessage, setShowMessage] = useState("");
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState(false);

    const signin = { email, password };

    const login = async () => {
        if(email === "" || password === "") {
            setShowMessage("Campo obligatorio");
            return;
        }else{
            console.log("signin",JSON.stringify(signin));
            setShowMessage("");
            setVisible(true);
            try {
                const deviceInfo = {
                    deviceId: Device.deviceId,
                    deviceName: Device.deviceName,
                    deviceType: Device.deviceType,
                    deviceModel: Device.modelName,
                    deviceOS: Device.osName,
                    deviceOSVersion: Device.osVersion,
                    userAgent: Device.userAgent,
                };
                const payload = {
                    ...signin,
                    device: deviceInfo,
                };

                const response = await AxiosClient({
                    url:"/auth/signin",
                    method:"POST",
                    data: payload
                })
                console.log("response",payload);
                const userData = response.data;
                await AsyncStorage.setItem("role", JSON.stringify(userData.roles));
                await AsyncStorage.setItem("user",JSON.stringify(userData));
                dispatch({ type: 'SIGNIN', token: userData.token, role: userData.roles});
            } catch (error) {
                console.log(error);
                setShowMessage("Credenciales incorrectas");
                setMessage(true);
                setTimeout(() => {
                  setMessage(false);
                }, 2000);
              }finally{
                setVisible(false);
              }
            }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>CODEGA</Text>
            <View style={styles.form}>
                <View style={{ marginVertical: 20 }}>
                    <Text style={{ color: 'white', fontSize: 18 }}>Correo Electrónico</Text>
                    <Input
                        placeholder='Email'
                        keyboardType="email-address"
                        leftIcon={<Icon name='email' color='white' />}
                        style={{ color: 'white' }}
                        onChange={({ nativeEvent: { text } }) => setEmail(text)}
                        errorMessage={showMessage}
                    />
                </View>
                <View style={{ marginVertical: 20 }}>
                    <Text style={{ color: 'white', fontSize: 18 }}>Contraseña</Text>
                    <Input
                        placeholder='Password'
                        leftIcon={<Icon name='lock' color='white' />}
                        style={{ color: 'white' }}
                        secureTextEntry={showPassword}
                        onChange={({ nativeEvent: { text } }) => setPassword(text)}
                        rightIcon={
                            <Icon
                                type="material-community"
                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                color='white'
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                        errorMessage={showMessage}
                    />
                </View>
                <Button title='Iniciar Sesión' buttonStyle={styles.button} onPress={login} />
                <Loading
                    visible={visible}
                    title='Iniciando sesion...'
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3A384A'
    },
    title: {
        color: '#fff',
        textTransform: 'uppercase',
        marginTop: 16,
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 50,
    },
    form: {
        width: '80%',
        marginTop: 16
    },
    button: {
        borderRadius: 10,
        borderColor: 'transparent',
        borderWidth: 0,
    }
})