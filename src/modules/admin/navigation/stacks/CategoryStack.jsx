import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import CatList from '../../screens/CatList'
import CreateCat from '../../../components/categories/CreateCat'
import EditCat from '../../../components/categories/EditCat'

const Stack = createStackNavigator()

export default function CategoryStack() {
  return (
    <Stack.Navigator 
    initialRouteName='Categorías'
      screenOptions={{
        headerShown: false,   
      }}>
      <Stack.Screen name="Categorías" component={CatList} />
      <Stack.Screen name="CreateCat" component={CreateCat} />
      <Stack.Screen name="EditCat" component={EditCat} />
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