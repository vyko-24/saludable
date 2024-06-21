import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import LoanInfo from '../../../components/loan/LoanInfo';
import LoanList from '../../screens/LoanList';
import CreateLoan from '../../../components/loan/CreateLoan';
import TransInfo from '../../../components/transactions/TransInfo';
import CreateTrans from '../../../components/transactions/CreateTrans';

const Stack = createStackNavigator();

export default function LoanStack() {
  return (
    <Stack.Navigator 
    initialRouteName='Préstamos'
      screenOptions={{
        headerShown: false,   
      }}>
      <Stack.Screen name="Préstamos" component={LoanList} />
      <Stack.Screen name="CreateLoan" component={CreateLoan} />
      <Stack.Screen name="LoanInfo" component={LoanInfo}/>
      <Stack.Screen name="CreatePay" component={CreateTrans}/>
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