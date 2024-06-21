import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import UserChartView from '../../screens/UserChartView'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator()

export default function UserChartStack() {
  return (
    <Stack.Navigator 
    initialRouteName='Reportes'
      screenOptions={{
        headerShown: false,   
      }}>
      <Stack.Screen name="Reportes" component={UserChartView} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})