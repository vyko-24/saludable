import 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { Icon } from '@rneui/base'
import { NavigationContainer } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AuthContext from '../../../config/context/auth-context'
import { createDrawerNavigator } from '@react-navigation/drawer';
import Test from '../../admin/Test';
import UserAccountStack from './stacks/UserAccountStack';
import UserCalendarStack from './stacks/UserCalendarStack';
import UserTransStack from './stacks/UserTransStack';
import UserLoanStack from './stacks/UserLoanStack';
import UserCategoryStack from './stacks/UserCategoryStack';
import UserChartStack from './stacks/UserChartStack';

const Drawer = createDrawerNavigator();

export default function NavigationUser() {
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
                    name="UserTransStack"
                    component={UserTransStack}
                    options={{ title: 'Transacciones' }}
                />
                <Drawer.Screen
                    name="UserAccountStack"
                    component={UserAccountStack}
                    options={{ title: 'Cuentas' }}
                />
                <Drawer.Screen
                    name="UserLoanStack"
                    component={UserLoanStack}
                    options={{ title: 'Prestamos' }}
                />
                <Drawer.Screen
                    name="UserCategoryStack"
                    component={UserCategoryStack}
                    options={{ title: 'Categorias' }}
                />
                <Drawer.Screen
                    name="UserCalendarStack"
                    component={UserCalendarStack}
                    options={{ title: 'Calendario' }}
                />
                <Drawer.Screen
                    name="UserChartStack"
                    component={UserChartStack}
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
        case 'UserTransStack':
            iconName = focused ? 'swap-horizontal-bold' : 'swap-horizontal';
            iconType = 'material-community';
            break;
        case 'UserAccountStack':
            iconName = focused ? 'account-cash' : 'account-cash-outline';
            iconType = 'material-community';
            break;
        case 'UserLoanStack':
            iconName = focused ? 'hand-coin' : 'hand-coin-outline';
            iconType = 'material-community';
            break;
        case 'UserChartStack':
            iconName = focused ? 'chart-pie' : 'chart-pie';
            iconType = 'material-community';
            break;
        case 'UserCategoryStack':
            iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted';
            iconType = 'material-community';
            break;
        case 'UserCalendarStack':
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