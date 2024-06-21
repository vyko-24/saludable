import { StyleSheet, Text, View, Vibration } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import Loading from '../../../kernel/Loading';
import { Input, ListItem, Button, CheckBox, FAB, Icon, Dialog, SpeedDial, Divider, LinearProgress } from '@rneui/base';
import AxiosClient from '../../../config/http-gateway/http-client';
import { ScrollView } from 'react-native-gesture-handler';
import Message from '../../../kernel/Message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserLoanList(props) {
  const { navigation } = props;
  const [message, setMessage] = useState(false);
  const [loans, setLoans] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [pay, setPay] = useState([]);
  const [rol, setRole] = useState([]);
  const [userid, setUserid] = useState(null);
  const [msg, setMsg] = useState('Error. Inténtelo más tarde');

  const getRol = async () => {
    const rolesString = await AsyncStorage.getItem("user");
    const rolesArray = JSON.parse(rolesString);
    setUserid(rolesArray.user.id);
    setRole(rolesArray.roles)
  }

  const getLoans = async (userid) => {
    if (!userid) return;
      setVisible(true);
      try {
          const response = await AxiosClient({
              url: '/prestamo/usuario/'+userid,
              method: 'GET'
          })
          if (response.status === 'OK') {
              setLoans(response.data)
              setVisible(false);
          }
      } catch (error) {
          console.log(error);
          if(error.response.status === 400){
            setMsg('No hay prestamos registrados');
          }else{
            setMsg('Error. Inténtelo más tarde');
          }
          setMessage(true);
          setTimeout(() => {
              setMessage(false);
          }, 2000);
      } finally {
          setVisible(false);
      }
  }

  const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const formattedDay = day < 10 ? `0${day}` : day;
      const formattedMonth = month < 10 ? `0${month}` : month;

      return `${formattedDay}-${formattedMonth}-${year}`;
  };
  
  useEffect(() => {
    const initializeUserId = async () => {
      await getRol();
    };
    initializeUserId();
  }, []);

  useEffect(() => {
    if (userid) {
      getLoans(userid)
    }
  }, [userid]);

  useFocusEffect(
    useCallback(() => {
      if (userid) {
        getLoans(userid)
        setSelectedLoan(null);
      }
    }, [userid])
  );


  const getPays = async (id) => {
      try {
          setVisible(true);
          const response = await AxiosClient({
              url: "/transaccion/prestamo/" + id,
              method: "GET",
          });
          if (!response.error) {
              setPay(response.data);
          }
      } catch (error) {
          console.log(error);
          setMessage(true);
          setTimeout(() => {
              setMessage(false);
          }, 2000);
      } finally {
          setVisible(false);
      }
  };

  const formatMoney = (amount) => {
      return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };
  
  const hasCreateTransRole = rol.some(role => role.name === 'Crear Transacciones');
  const hasUpdateTransRole = rol.some(role => role.name === 'Editar Transacciones');
  const hasCreateLoanRole = rol.some(role => role.name === 'Crear Préstamos');
  const hasUpdateLoanRole = rol.some(role => role.name === 'Editar Préstamos');

  return (
      <View style={styles.container}>
          <Input
              placeholder='Buscar...'
              leftIcon={{ type: 'material-community', name: 'magnify', color: '#fff' }}
              style={{ color: '#fff' }}
              onChangeText={(text) => setFilterText(text)}
              value={filterText} />
          <Loading
              visible={visible}
              title='Cargando...'
          />
          
        <Message visible={message} title={msg} />
          <View style={{ flex: 1 }}>
              <ScrollView>
                  {loans.filter((loan) => loan.descripcion.includes(filterText)).map((loan, index) => {
                      const progress = ((loan.reembolzado * 100) / loan.total) / 100;
                      const colors = loan.tipoPrestamo ? ('#3BCE5E') : ('#EF5350');
                      return (
                          <ListItem.Swipeable
                              key={index}
                              bottomDivider
                              containerStyle={{ backgroundColor: '#3A384A' }}
                              onPress={() => { setSelectedLoan(loan); getPays(loan.id) }}
                              leftContent={(reset) => (
                                  <Button
                                      title="Info"
                                      onPress={() => {
                                              navigation.navigate('LoanInfo', { loan, edit: false, admin: true });
                                          reset();
                                      }}
                                      icon={{ name: 'info', color: 'white' }}
                                      buttonStyle={{ minHeight: '100%' }}
                                  />
                              )}
                              rightContent={(reset) => (
                                  <Button
                                      onPress={() => {
                                              navigation.navigate('LoanInfo', { loan, edit: true, admin: true });
                                          reset();
                                      }}
                                      disabled={!hasUpdateLoanRole}
                                      icon={{ name: 'edit', color: 'white' }}
                                      buttonStyle={{ minHeight: '100%', backgroundColor: 'orange' }}
                                  />
                              )}
                          >
                              <ListItem.Content>
                                  <View style={{ flex: 1 }}>
                                      <View style={styles.titleView}>
                                          <View style={{ flex: 1 }}><Text style={{ color: 'white', size: 20 }}>{loan.descripcion}</Text></View>
                                          <View style={{ flex: 1 }}><Text style={{ color: colors }}>$ {formatMoney(loan.total)}</Text></View>
                                      </View>
                                      <View style={styles.subtitleView}>
                                          <View style={{ flex: 1 }}><Text style={styles.ratingText}>{loan.transaccion[0].origen.nombre}</Text></View>
                                          <View style={{ flex: 1 }}>
                                              <LinearProgress
                                                  animation={false}
                                                  style={{ marginVertical: 10, width: '50%' }}
                                                  value={progress}
                                                  variant="determinate"
                                                  color='#0D6EFD'
                                              />
                                          </View>
                                      </View>
                                  </View>
                              </ListItem.Content>
                          </ListItem.Swipeable>
                      )
                  })}
              </ScrollView>
              <View style={{ height: 100 }}>
              <FAB
                      visible={true}
                      icon={{ name: 'add', color: 'white' }}
                      placement="right"
                      size="large"
                      color='#0D6EFD'
                      disabled={!hasCreateLoanRole}
                      onPress={() => navigation.navigate('CreateLoan', { admin: false })}
                  />
              </View>
              <Divider style={{ marginBottom: 20 }} width={3} insetType="middle" color='#86939E' />
              {selectedLoan &&
                  <>
                      <ScrollView>
                          {selectedLoan && pay.map((transaction, index) => {

                              const colors = transaction.tipo.nombre === 'Transferencia' ? (
                                  '#0D6EFD'
                              ) : (transaction.tipo.nombre === 'Ingreso' ? '#3BCE5E' : '#EF5350'
                              );
                              return (
                                  <ListItem.Swipeable
                                      key={index}
                                      bottomDivider
                                      containerStyle={{ backgroundColor: '#3A384A' }}
                                      leftContent={(reset) => (
                                          <Button
                                              title="Info"
                                              onPress={() => {
                                                  navigation.navigate('TransInfo', { transaction, edit: false, admin: true });
                                                  reset();
                                              }}
                                              icon={{ name: 'info', color: 'white' }}
                                              buttonStyle={{ minHeight: '100%' }}
                                          />
                                      )}

                                      rightContent={(reset) => (
                                          !transaction.status && (
                                              <Button
                                                  onPress={() => {
                                                      navigation.navigate('TransInfo', { transaction, edit: true});
                                                      reset();
                                                  }}
                                                  disabled={!hasUpdateTransRole}
                                                  icon={{ name: 'edit', color: 'white' }}
                                                  buttonStyle={{ minHeight: '100%', backgroundColor: 'orange' }}
                                              />
                                          )
                                      )}
                                  >
                                      <CheckBox
                                          size={20}
                                          center
                                          checked={transaction.status}
                                          containerStyle={{ backgroundColor: '#3A384A', width: "5%" }} />
                                      <ListItem.Content>
                                          <View style={{ flex: 1 }}>
                                              <View style={styles.titleView}>
                                                  <View style={{ flex: 1 }}><Text style={{ color: 'white', size: 20 }}>{transaction.descripcion}</Text></View>
                                                  <View style={{ flex: 1 }}><Text style={{ color: colors }}>$ {formatMoney(transaction.monto)}</Text></View>
                                              </View>
                                              <View style={styles.subtitleView}>
                                                  <View style={{ flex: 1 }}><Text style={styles.ratingText}>{formatDate(transaction.fecha)}</Text></View>
                                                  <View style={{ flex: 1 }}><Text style={styles.ratingText}>{transaction.categoria.nombre}</Text></View>
                                              </View>
                                          </View>
                                      </ListItem.Content>
                                  </ListItem.Swipeable>
                              )
                          })
                          }
                      </ScrollView>
                      <View style={{ height: 100 }}>
                          <FAB
                              visible={true}
                              onPress={() => navigation.navigate('CreatePay', { loan: selectedLoan, prestamo:selectedLoan })}
                              icon={{ name: 'add', color: 'white' }}
                              placement="right"
                              size="large"
                              disabled={!hasCreateTransRole}
                              color='#0D6EFD'
                          />
                          <FAB
                          visible={selectedLoan ? true : false}
                          icon={{ name: 'cancel', type:'material-community', color: 'white' }}
                          placement="left"
                          size="large"
                          color='orange'
                          onPress={() => setSelectedLoan(null)}
                      />
                      </View>
                  </>}
          </View>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#3A384A'
  },
  text: {
      color: '#fff',
      marginHorizontal: 10
  },
  titleView: {
      flex: 1,
      width: '150%',
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  subtitleView: {
      flex: 1,
      width: '130%',
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  ratingText: {
      color: '#bbb',
  },
})