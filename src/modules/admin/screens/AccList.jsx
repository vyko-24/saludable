import { StyleSheet, Text, View, Vibration } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import Loading from '../../../kernel/Loading';
import { Input, ListItem, Button, CheckBox, FAB, Icon, Dialog, SpeedDial, Divider } from '@rneui/base';
import AxiosClient from '../../../config/http-gateway/http-client';
import { ScrollView } from 'react-native-gesture-handler';
import Message from '../../../kernel/Message';


export default function AccList(props) {
    const { navigation } = props;
    const [message, setMessage] = useState(false);
    const [acc, setAcc] = useState([]);
    const [gr, setGr] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [visible, setVisible] = useState(false); const [expandedGroups, setExpandedGroups] = useState({});
    const [visible1, setVisible1] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [open, setOpen] = useState(false);

    const handlePress = (grupoId) => {
        setExpandedGroups(prevState => ({
            ...prevState,
            [grupoId]: !prevState[grupoId] // Alternar el estado de expansión para el grupo específico
        }));
    };

    const getAccounts = async () => {
        setVisible(true);
        try {
            const response = await AxiosClient({
                url: '/cuenta/',
                method: 'GET'
            })
            if (response.status === 'OK') {
                setAcc(response.data)
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

    useEffect(() => {
        getAccounts()
        getGroups();
    }, []);

    useFocusEffect(
        useCallback(() => {
            getAccounts()
            getGroups();
        }, [])
    );
    

    const getGroups = async () => {
        setVisible(true);
        try {
            const response = await AxiosClient({
                url: '/grupo/',
                method: 'GET'
            })
            if (response.status === 'OK') {
                setGr(response.data)
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
    const toggleDialog1 = (group) => {
        setSelectedGroup(group);
        setVisible1(!visible1);
    };

    const formatMoney = (amount) => {
        return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    };

    return (
        <View style={styles.container}>
            <Input
                placeholder='Buscar...'
                leftIcon={{ type: 'material-community', name: 'magnify', color: '#fff' }}
                style={{ color: '#fff' }}
                onChangeText={(text) => setFilterText(text)}
                value={filterText} />
            <Loading
                visible={visible}
                title='Cargando...'
            />
            <Message visible={message} title='Error. Inténtelo más tarde' />
            <Dialog
                isVisible={visible1}
                onBackdropPress={toggleDialog1}
                style={{ color: '#bbb', fontWeight: 'bold', backgroundColor: '#3A384A' }}
                overlayStyle={{ backgroundColor: '#3A384A' }}
            >

                {selectedGroup && (
                    <>
                        <Dialog.Title title={selectedGroup.nombre} titleStyle={{ color: '#bbb' }} />
                        <Dialog.Actions>
                            <Dialog.Button title="Editar" onPress={() =>
                                navigation.navigate('EditGr', { selectedGroup, edit: true, admin: true })} />
                            <Dialog.Button title="Agregar cuenta" onPress={() => navigation.navigate('CreateAcc', { selectedGroup, gr: true, admin: true })} />
                        </Dialog.Actions>
                    </>
                )}
            </Dialog>
            <View style={{ flex: 1 }}>
                <ScrollView style={{ maxHeight: '50%' }}>
                    {gr.filter((gr) => {
                        return gr.nombre.toLowerCase().includes(filterText.toLowerCase());
                    }).map((grupo, index) => {

                        const isExpanded = expandedGroups[grupo.id] || false;
                        return (<>
                            <ListItem.Accordion
                                containerStyle={{ backgroundColor: '#3A384A' }}

                                content={
                                    <ListItem.Content>
                                        <ListItem.Title style={{ color: '#bbb', fontWeight: 'bold' }}>{grupo.nombre}</ListItem.Title>
                                    </ListItem.Content>
                                }

                                isExpanded={isExpanded}
                                onPress={() => handlePress(grupo.id)}
                                onLongPress={() => {
                                    toggleDialog1(grupo)
                                    Vibration.vibrate(50);
                                }}
                                expandIcon={<Icon name={'chevron-down'} type="material-community" color={'#bbb'} />}
                            >
                                {acc.filter(account => account.grupo && account.grupo.id === grupo.id).length === 0 ? (
                                    <ListItem
                                        containerStyle={{ backgroundColor: '#3A384A' }}
                                        bottomDivider
                                    >
                                        <ListItem.Content>
                                            <ListItem.Title style={{ color: '#bbb' }}>No hay cuentas</ListItem.Title>
                                        </ListItem.Content>
                                    </ListItem>
                                ) : (
                                    acc.map((account, i) => {
                                        if (account.grupo && account.grupo.id === grupo.id) {
                                            const color = account.saldo < 0 ? '#EF5350' : '#3BCE5E';
                                            return (
                                                <ListItem.Swipeable
                                                    key={index}
                                                    bottomDivider
                                                    containerStyle={{ backgroundColor: '#3A384A' }}
                                                    leftContent={(reset) => (
                                                        <Button
                                                            title="Info"
                                                            onPress={() => {
                                                                reset();
                                                                navigation.navigate('InfoAcc', { account, edit: false, admin: true });
                                                            }}
                                                            icon={{ name: 'info', color: 'white' }}
                                                            buttonStyle={{ minHeight: '100%' }}
                                                        />
                                                    )}
                                                    rightContent={(reset) => (
                                                        <Button
                                                            onPress={() => {
                                                                reset();
                                                                navigation.navigate('InfoAcc', { account, edit: true, admin: true });
                                                            }}
                                                            icon={{ name: 'edit', color: 'white' }}
                                                            buttonStyle={{ minHeight: '100%', backgroundColor: 'orange' }}
                                                        />
                                                    )}>
                                                    <ListItem.Content>
                                                        <View style={{ flex: 1 }}>
                                                            <View style={styles.titleView}>
                                                                <View style={{ flex: 1 }}><Text style={{ color: 'white', size: 20 }}>{account.nombre}</Text></View>
                                                                <View style={{ flex: 1 }}><Text style={{ color: color }}>${formatMoney(account.saldo)}</Text></View>
                                                            </View>
                                                        </View>
                                                    </ListItem.Content>
                                                </ListItem.Swipeable>
                                            )
                                        }
                                        return null;
                                    }
                                    ))}
                            </ListItem.Accordion>
                        </>
                        )
                    })}

                </ScrollView>
                <Divider style={{ marginBottom: 20 }} width={1.2} insetType="middle" color='#86939E' />
                <ScrollView>
                    {acc.filter((accounts) => {
                        return accounts.nombre.toLowerCase().includes(filterText.toLowerCase());
                    }).map((l, i) => {
                        const color = l.saldo < 0 ? '#EF5350' : '#3BCE5E';
                        return (
                            l.grupo === null && (
                                <ListItem.Swipeable
                                    key={i}
                                    bottomDivider
                                    containerStyle={{ backgroundColor: '#3A384A' }}
                                    leftContent={(reset) => (
                                        <Button
                                            title="Info"
                                            onPress={() => {
                                                reset();
                                                navigation.navigate('InfoAcc', { account: l, edit: false, admin: true });
                                            }}
                                            icon={{ name: 'info', color: 'white' }}
                                            buttonStyle={{ minHeight: '100%' }}
                                        />
                                    )}
                                    rightContent={(reset) => (
                                        <Button
                                            onPress={() => {
                                                reset();
                                                navigation.navigate('InfoAcc', { account: l, edit: true, admin: true });
                                            }}
                                            icon={{ name: 'edit', color: 'white' }}
                                            buttonStyle={{ minHeight: '100%', backgroundColor: 'orange', minWidth: 100 }}
                                        />
                                    )}
                                >
                                    <ListItem.Content>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.titleView}>
                                                <View style={{ flex: 1 }}><Text style={{ color: 'white', size: 20 }}>{l.nombre}</Text></View>
                                                <View style={{ flex: 1 }}><Text style={{ color: color }}>$ {formatMoney(l.saldo)}</Text></View>
                                            </View>
                                        </View>
                                    </ListItem.Content>
                                </ListItem.Swipeable>
                            )
                        )
                    })}
                </ScrollView>
            </View>
            <SpeedDial
                isOpen={open}
                icon={{ name: 'add', color: 'white' }}
                placement="right"
                size="large"
                color='#0D6EFD'
                onOpen={() => setOpen(!open)}
                onClose={() => setOpen(!open)}
                openIcon={{ name: 'close', color: '#fff' }}>
                <SpeedDial.Action
                    icon={{ name: 'card-plus', color: '#fff', type: 'material-community' }}
                    title="Crear cuenta"
                    color='#0D6EFD'
                    onPress={() => navigation.navigate('CreateAcc', { admin: true })}
                />
                <SpeedDial.Action
                    icon={{ name: 'group', color: '#fff', type: 'material-community' }}
                    title="Crear grupo"
                    color='#0D6EFD'
                    onPress={() => navigation.navigate('CreateGR', { admin: true })}
                />
            </SpeedDial>
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
    },
    titleView: {
        flex: 1,
        width: '150%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    subtitleView: {
        flex: 1,
        width: '130%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ratingText: {
        color: '#bbb',
    },
})