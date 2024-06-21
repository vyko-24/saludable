import 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native';
import Login from './src/modules/auth/Login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from './src/config/context/auth-context';
import { AuthManager } from './src/config/context/auth-manager';
import React, { useEffect, useState, useReducer } from 'react';
import NavigationAdmin from './src/modules/admin/navigation/NavigationAdmin';
import NavigationUser from './src/modules/other/navigation/NavigationUser';

const initialState = {
  signed: false,
  role: null,
};
const init = async () => {
  const rolesString = await AsyncStorage.getItem("role");
    const rolesArray = JSON.parse(rolesString);
  if (rolesArray) {
    return { signed: true, role:rolesArray };
  }
  return initialState;
};


export default function App() {
  const [sesion, setSesion] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [state, dispatch] = useReducer(AuthManager, initialState, init);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    init().then((initialState) => dispatch({ type: 'INIT', ...initialState }));
  }, []);

  const getRol = async() =>{
    const rolesString = await AsyncStorage.getItem("role");
    const rolesArray = JSON.parse(rolesString);
    console.log("rolesArray",rolesArray);
    if(rolesArray){
      console.log("si está");
      if (rolesArray[0].name==="ADMIN") {
        setSesion(true);
        setAdmin(true);
        console.log("es admin");
        return}
        setAdmin(false);
        setSesion(true);
        console.log("no es admin");
      }else{
        console.log("no está");
        setAdmin(false);
        setSesion(false);
      }
  }

  
  useEffect(() => {
    getRol();
    console.log("AEUOIO");
    setReload(false);
  }, [state]);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {sesion && state!==null ? (admin ? <NavigationAdmin /> : <NavigationUser />) : <Login />
      }
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
