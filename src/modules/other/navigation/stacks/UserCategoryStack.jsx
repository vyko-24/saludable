import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import CreateCat from '../../../components/categories/CreateCat'
import EditCat from '../../../components/categories/EditCat'
import UserCatList from '../../screens/UserCatList'

const Stack = createStackNavigator()

export default function UserCategoryStack() {
  return (
    <Stack.Navigator 
    initialRouteName='Categorías'
      screenOptions={{
        headerShown: false,   
      }}>
      <Stack.Screen name="Categorías" component={UserCatList} />
      <Stack.Screen name="CreateCat" component={CreateCat} />
      <Stack.Screen name="EditCat" component={EditCat} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})