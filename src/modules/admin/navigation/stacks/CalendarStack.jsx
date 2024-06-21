import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Calendar from '../../screens/CalendarView'
import TransInfo from '../../../components/transactions/TransInfo'

const Stack = createStackNavigator()

export default function CalendarStack() {
  return (
    <Stack.Navigator 
    initialRouteName='Calendario'
      screenOptions={{
        headerShown: false,   
      }}>
      <Stack.Screen name="Calendario" component={Calendar} />
      <Stack.Screen name="TransInfo" component={TransInfo} />
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