import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import UsersList from '../../screens/UsersList'
import CreateUser from '../../../components/users/CreateUser'
import UserInfo from '../../../components/users/UserInfo'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator();

export default function UsersStack(props) {
  const {navigation} = props;

  return (
    <Stack.Navigator
    initialRouteName='Usuarios'
      screenOptions={{
        headerShown: false,   
      }}>
      <Stack.Screen name="Usuarios" component={UsersList} />
      <Stack.Screen name="CreateUser" component={CreateUser} />
      <Stack.Screen name="UserInfo" component={UserInfo}/>
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