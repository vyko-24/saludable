import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import UserTransList from '../../screens/UserTransList'
import TransInfo from '../../../components/transactions/TransInfo'
import CreateTrans from '../../../components/transactions/CreateTrans'

const Stack = createStackNavigator();

export default function UserTransStack() {
  return (
    <Stack.Navigator 
    initialRouteName='Transacciones'
      screenOptions={{
        headerShown: false,   
      }}>
      <Stack.Screen name="Transacciones" component={UserTransList} />
      <Stack.Screen name="CreateTrans" component={CreateTrans} />
      <Stack.Screen name="TransInfo" component={TransInfo}/>
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})