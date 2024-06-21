import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { Input, Icon, ListItem, Button, Badge, FAB } from '@rneui/base'
import { ScrollView } from 'react-native-gesture-handler'
import AxiosClient from '../../../config/http-gateway/http-client'
import Loading from '../../../kernel/Loading'
import { useFocusEffect } from '@react-navigation/native';
import Message from '../../../kernel/Message'

export default function UsersList(props) {
    const { navigation } = props;
    const [users, setUsers] = useState([])
    const [filterText, setFilterText] = useState('');
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState(false);

    const getUsers = async () => {
        setVisible(true);
        try {
            const response = await AxiosClient({
                url: '/usuario/',
                method: 'GET'
            })
            if (response.status === 'OK') {
                setUsers(response.data)
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

    useEffect(() => {
        getUsers()
    }, []);
    useFocusEffect(
        useCallback(() => {
            getUsers(); // Llamar a getUsers cuando la pantalla obtenga el foco
        }, [])
    );

    const goUpdate = (user) => {
        console.log(user);
    }


    const changeStatus = async (id) => {
        try {
            const response = await AxiosClient({
                method: 'PATCH',
                url: '/usuario/status/' + id
            });
            console.log("Respuesta del servidor:", response);
            if (!response.error) {
                getUsers();
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

    return (
        <View style={styles.container}>
            <Input
                placeholder='Buscar...'
                leftIcon={{ type: 'material-community', name: 'magnify', color: '#fff' }}
                style={{ color: '#fff' }}
                onChangeText={(text) => setFilterText(text)}  // Usar onChangeText en lugar de onChange
                value={filterText} />
            <ScrollView>
                <Loading
                    visible={visible}
                    title='Cargando...'
                />
                <Message visible={message} title='Error. Inténtelo más tarde' />
                {users.filter((user) => {
                    return user.username.toLowerCase().includes(filterText.toLowerCase());
                }).map((user, index) => (
                    <ListItem.Swipeable
                        key={index}
                        bottomDivider
                        containerStyle={{ backgroundColor: '#3A384A' }}
                        leftContent={(reset) => (
                            <Button
                                title="Info"
                                onPress={() => {
                                    navigation.navigate('UserInfo', { user, edit: false });
                                    reset();
                                }}
                                icon={{ name: 'info', color: 'white' }}
                                buttonStyle={{ minHeight: '100%' }}
                            />
                        )}
                        rightContent={(reset) => (
                            user.roles[0] && user.roles[0].name === 'ADMIN' ? (
                                <Button
                                    onPress={() => {
                                        navigation.navigate('UserInfo', { user, edit: true });
                                        reset();
                                    }}
                                    icon={{ name: 'edit', color: 'white' }}
                                    buttonStyle={{ minHeight: '100%', backgroundColor: 'orange' }}
                                />
                            ) : (
                                <View style={{ flexDirection: 'row' }}>
                                    <Button
                                        onPress={() => {
                                            navigation.navigate('UserInfo', { user, edit: true });
                                            reset();
                                        }}
                                        icon={{ name: 'edit', color: 'white' }}
                                        buttonStyle={{ minHeight: '100%', backgroundColor: 'orange', width: 65 }}
                                    />
                                    <Button
                                        onPress={() => {
                                            changeStatus(user.id)
                                            reset();
                                        }}
                                        icon={{ name: user.status ? 'account-cancel' : 'account-check', type: 'material-community', color: 'white' }}
                                        buttonStyle={{ minHeight: '100%', backgroundColor: user.status ? 'red' : 'green', width: 65 }}
                                    />
                                </View>
                            )
                        )}
                    >
                        <Badge status={user.status ? "success" : "#d9d9d9"} badgeStyle={{ height: 14, width: 14, borderRadius: 100 }} />
                        <ListItem.Content >
                            <ListItem.Title style={{ color: '#bbb' }}>
                                {user.username}
                            </ListItem.Title>
                        </ListItem.Content>
                    </ListItem.Swipeable>
                ))}
            </ScrollView>

            <View style={{ height: 100 }}>
                <FAB
                    visible={true}
                    icon={{ name: 'add', color: 'white' }}
                    placement="right"
                    size="large"
                    color='#0D6EFD'
                    onPress={() => navigation.navigate('CreateUser')}
                />
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#3A384A'
    },
    text: {
        color: '#fff',
        marginHorizontal: 10
    }
})