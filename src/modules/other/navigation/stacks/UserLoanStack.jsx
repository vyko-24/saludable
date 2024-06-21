import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import UserLoanList from '../../screens/UserLoanList'
import CreateLoan from '../../../components/loan/CreateLoan';
import TransInfo from '../../../components/transactions/TransInfo';
import CreateTrans from '../../../components/transactions/CreateTrans';
import LoanInfo from '../../../components/loan/LoanInfo';

const Stack = createStackNavigator()

export default function UserLoanStack() {
  return (
    <Stack.Navigator 
    initialRouteName='Préstamos'
      screenOptions={{
        headerShown: false,   
      }}>
      <Stack.Screen name="Préstamos" component={UserLoanList} />
      <Stack.Screen name="CreateLoan" component={CreateLoan} />
      <Stack.Screen name="LoanInfo" component={LoanInfo}/>
      <Stack.Screen name="CreatePay" component={CreateTrans}/>
      <Stack.Screen name="TransInfo" component={TransInfo}/>
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})