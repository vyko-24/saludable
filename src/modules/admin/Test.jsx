import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native'
import { Button } from '@rneui/base'
import React, { useState, useEffect, useContext } from 'react'
import { Dialog } from '@rneui/themed';
import AuthContext from '../../config/context/auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../../kernel/Loading';

export default function Test(props) {
  const { navigation } = props;
  const { state, dispatch } = useContext(AuthContext);
  const [isDialogVisible, setDialogVisible] = useState(true);
  const handleLogout = async () => {
    console.log("Sesión cerrada");
    try {
      dispatch({ type: 'SIGNOUT' });
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error al limpiar AsyncStorage:', error);
    }
  };
  const handleCancel = () => {
    setDialogVisible(false);
    navigation.goBack();
  };

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      setDialogVisible(true);
    });

    return focusListener;
  }, [navigation]);


  return (
    <View style={styles.container}>
      <Dialog
        isVisible={isDialogVisible}
        backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        overlayStyle={{ backgroundColor: '#3A384A' }}
      >
        <Dialog.Title title="Desea cerrar sesión?" titleStyle={styles.text} />
        <Dialog.Actions>
          <Dialog.Button title="Aceptar" onPress={handleLogout} />
          <Dialog.Button title="Cancelar" onPress={handleCancel} />
        </Dialog.Actions>
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3A384A'
  },
  text: {
    marginBottom: 10,
    color: 'white',
  },
});