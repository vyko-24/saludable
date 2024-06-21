import 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { Icon } from '@rneui/base'
import UsersStack from './stacks/UsersStack'
import TransStack from './stacks/TransStack'
import LoanStack from './stacks/LoanStack'
import ChartStack from './stacks/ChartStack'
import CategoryStack from './stacks/CategoryStack'
import CalendarStack from './stacks/CalendarStack'
import AccountStack from './stacks/AccountStack'
import { NavigationContainer } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AuthContext from '../../../config/context/auth-context'
import { createDrawerNavigator } from '@react-navigation/drawer';
import Test from '../Test';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AxiosClient from '../../../config/http-gateway/http-client';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const Drawer = createDrawerNavigator();

export default function NavigationAdmin() {
    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                sendTokenToBackend(token);
            }
        });
    }, []);

    const sendTokenToBackend = async (token) => {
        try {
            const response = await AxiosClient({
                url: "/deviceToken/device-token",
                method: "POST",
                data: { token }
            });
            console.log('Token enviado al backend:', response.data);
        } catch (error) {
            console.error('Error enviando token al backend:', error);
        }
    };

    const registerForPushNotificationsAsync = async () => {
        let token;
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig.extra.eas.projectId,
            })).data;
            console.log(token);
        } else {
            alert('Must use physical device for Push Notifications');
        }

        return token;
    };

    return (
        <NavigationContainer>
            <Drawer.Navigator
                screenOptions={({ route }) => ({
                    drawerIcon: ({ focused, color, size }) => {
                        const { iconName, iconType } = getIconName(route.name, focused);
                        return <Icon name={iconName} type={iconType} size={size} color={color} />
                    },
                    headerStyle: {
                        backgroundColor: '#4C4A60',
                    },
                    headerTintColor: '#fff',
                    drawerActiveTintColor: '#fff',
                    drawerInactiveTintColor: '#b5b5b5',
                    drawerStyle: {
                        backgroundColor: '#4C4A60',
                    },
                })}
            >
                <Drawer.Screen
                    name="UsersStack"
                    component={UsersStack}
                    options={{ title: 'Usuarios' }}
                />
                <Drawer.Screen
                    name="TransStack"
                    component={TransStack}
                    options={{ title: 'Transacciones' }}
                />
                <Drawer.Screen
                    name="AccountStack"
                    component={AccountStack}
                    options={{ title: 'Cuentas' }}
                />
                <Drawer.Screen
                    name="LoanStack"
                    component={LoanStack}
                    options={{ title: 'Prestamos' }}
                />
                <Drawer.Screen
                    name="CategoryStack"
                    component={CategoryStack}
                    options={{ title: 'Categorias' }}
                />
                <Drawer.Screen
                    name="CalendarStack"
                    component={CalendarStack}
                    options={{ title: 'Calendario' }}
                />
                <Drawer.Screen
                    name="ChartStack"
                    component={ChartStack}
                    options={{ title: 'Reportes' }}
                />
                <Drawer.Screen
                    name="Logout"
                    options={{ title: 'Cerrar Sesión' }}
                    component={Test}
                />

            </Drawer.Navigator>
        </NavigationContainer>
    )
}

const getIconName = (routeName, focused) => {
    let iconName = '';
    let iconType = '';
    switch (routeName) {
        case 'UsersStack':
            iconName = focused ? 'account-group' : 'account-group-outline';
            iconType = 'material-community';
            break;
        case 'TransStack':
            iconName = focused ? 'swap-horizontal-bold' : 'swap-horizontal';
            iconType = 'material-community';
            break;
        case 'AccountStack':
            iconName = focused ? 'account-cash' : 'account-cash-outline';
            iconType = 'material-community';
            break;
        case 'LoanStack':
            iconName = focused ? 'hand-coin' : 'hand-coin-outline';
            iconType = 'material-community';
            break;
        case 'ChartStack':
            iconName = focused ? 'chart-pie' : 'chart-pie';
            iconType = 'material-community';
            break;
        case 'CategoryStack':
            iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted';
            iconType = 'material-community';
            break;
        case 'CalendarStack':
            iconName = focused ? 'calendar' : 'calendar-outline';
            iconType = 'material-community';
            break;
        case 'Logout':
            iconName = focused ? 'exit-to-app' : 'exit-to-app';
            iconType = 'material-community';
            break;
        default:
            break;
    }
    return { iconName, iconType };

}

const styles = StyleSheet.create({})