import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import UserAccList from '../../screens/UserAccList'
import CreateAcc from '../../../components/accounts/CreateAcc'
import InfoAcc from '../../../components/accounts/InfoAcc'
import EditGr from '../../../components/accounts/EditGr'
import CreateGR from '../../../components/accounts/CreateGR'

const Stack = createStackNavigator();

export default function UserAccountStack() {
  return (
    <Stack.Navigator 
    initialRouteName='Cuentas'
      screenOptions={{
        headerShown: false,   
      }}>
      <Stack.Screen name="Cuentas" component={UserAccList} />
      <Stack.Screen name="CreateAcc" component={CreateAcc} />
      <Stack.Screen name="InfoAcc" component={InfoAcc}/>
      <Stack.Screen name="EditGr" component={EditGr}/>
      <Stack.Screen name="CreateGR" component={CreateGR}/>
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})