import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import TransInfo from '../../../components/transactions/TransInfo'
import UserCalenarView from '../../screens/UserCalenarView'

const Stack = createStackNavigator()

export default function UserCalendarStack() {
  return (
    <Stack.Navigator
      initialRouteName='Calendario'
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Calendario" component={UserCalenarView} />
      <Stack.Screen name="TransInfo" component={TransInfo} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})