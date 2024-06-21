import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import ChartView from '../../screens/ChartView'

const Stack = createStackNavigator();

export default function ChartStack() {
  return (
    <Stack.Navigator 
    initialRouteName='Reportes'
      screenOptions={{
        headerShown: false,   
      }}>
      <Stack.Screen name="Reportes" component={ChartView} />
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