import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import TransList from '../../screens/TransList';
import CreateTrans from '../../../components/transactions/CreateTrans'
import TransInfo from '../../../components/transactions/TransInfo'

const Stack = createStackNavigator();

export default function TransStack(props) {
  return (
    <Stack.Navigator 
    initialRouteName='Transacciones'
      screenOptions={{
        headerShown: false,   
      }}>
      <Stack.Screen name="Transacciones" component={TransList} />
      <Stack.Screen name="CreateTrans" component={CreateTrans} />
      <Stack.Screen name="TransInfo" component={TransInfo}/>
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3A384A'
  },
})