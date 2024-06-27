import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import Loading from '../../../kernel/Loading';
import { Input, ListItem, Button, CheckBox, FAB, Tab, TabView } from '@rneui/base';
import AxiosClient from '../../../config/http-gateway/http-client';
import { ScrollView } from 'react-native-gesture-handler';
import Message from '../../../kernel/Message';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function UserTransList(props) {
  const { navigation } = props;
  const [message, setMessage] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [visible, setVisible] = useState(false);
  const [userid, setUserid] = useState(null);
  const [rol, setRol] = useState([]);
  const [msg, setMsg] = useState('Error. Inténtelo más tarde');

  const getRol = async () => {
    const userString = await AsyncStorage.getItem("user");
    const userArray = JSON.parse(userString);
    const rolesString = await AsyncStorage.getItem("user");
    const rolesArray = JSON.parse(rolesString);
    setUserid(userArray.user.id);
    setRol(rolesArray.roles);
  }

  const getTransactions = async (userid) => {
    if (!transactions)
    setVisible(true);
  
    if (!userid) return;
    try {
      const response = await AxiosClient({
        url: '/transaccion/usuario/' + userid,
        method: 'GET'
      })
      if (response.status === 'OK') {
        const sorted = response.data.slice().sort((a, b) => b.fecha.localeCompare(a.fecha));
        setTransactions(sorted);
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        setMsg('No hay transacciones registradas');
      } else {
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

  useEffect(() => {
    const initializeUserId = async () => {
      await getRol();
    };
    initializeUserId();
  }, []);

  useEffect(() => {
    if (userid) {
      getTransactions(userid);
    }
  }, [userid]);

  useFocusEffect(
    useCallback(() => {
      if (userid) {
        getTransactions(userid);
      }
    }, [userid])
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    return `${formattedDay}-${formattedMonth}-${year}`;
  };


  const formatMoney = (amount) => {
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const hasCreateTransRole = rol.some(role => role.name === 'Crear Transacciones');
  const hasUpdateTransRole = rol.some(role => role.name === 'Editar Transacciones');
  const [index, setIndex] = React.useState(0);

  return (
    <>
      <Tab
        value={index}
        onChange={(e) => setIndex(e)}
        indicatorStyle={{
          backgroundColor: '#86939E',
          height: 3,
        }}
        containerStyle={{ backgroundColor: "#4C4A60" }}
        scrollable={false}
      >
        <Tab.Item
          title="General"
          titleStyle={{ fontSize: 10, color: 'white' }}
        />
        <Tab.Item
          title="Ingresos"
          titleStyle={{ fontSize: 10, color: 'white' }}
        />
        <Tab.Item
          title="Egresos"
          titleStyle={{ fontSize: 10, color: 'white' }}
        />
        <Tab.Item
          title="Transferencias"
          titleStyle={{ fontSize: 10, color: 'white' }}
        />
      </Tab>


      <View style={styles.container}>
        <Loading
          visible={visible}
          title='Cargando...'
        />
        <Message visible={message} title={msg} />
        <TabView value={index} onChange={setIndex} animationType="spring"  disableSwipe={true}>
          <TabView.Item style={{ width: '100%' }}>
            <ScrollView>
              {transactions.filter((transaction) => {
                return transaction.nombre.toLowerCase().includes(filterText.toLowerCase())
              }).map((transaction, index) => {
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
                          navigation.navigate('TransInfo', { transaction, edit: false });
                          reset();
                        }}
                        icon={{ name: 'info', color: 'white' }}
                        buttonStyle={{ minHeight: '100%' }}
                      />
                    )}
                    rightContent={(reset) => (
                      !transaction.status && (
                        <Button
                          disabled={!hasUpdateTransRole}
                          onPress={() => {
                            console.log(transaction.id);
                            navigation.navigate('TransInfo', { transaction, edit: true });
                            reset();
                          }}
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
                    <ListItem.Content style={{ flex: 1 }}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.titleView}>
                          <View style={{ flex: 1 }}><Text style={{ color: 'white', size: 20 }}>{transaction.nombre}</Text></View>
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
              })}
            </ScrollView>
          </TabView.Item>
          <TabView.Item style={{ width: '100%' }}>
            <ScrollView>
              {transactions.filter((transaction) => {
                return transaction.tipo.id === 1 && transaction.nombre.toLowerCase().includes(filterText.toLowerCase())
              }).map((transaction, index) => {
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
                          navigation.navigate('TransInfo', { transaction, edit: false });
                          reset();
                        }}
                        icon={{ name: 'info', color: 'white' }}
                        buttonStyle={{ minHeight: '100%' }}
                      />
                    )}
                    rightContent={(reset) => (
                      !transaction.status && (
                        <Button
                          disabled={!hasUpdateTransRole}
                          onPress={() => {
                            console.log(transaction.id);
                            navigation.navigate('TransInfo', { transaction, edit: true });
                            reset();
                          }}
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
                    <ListItem.Content style={{ flex: 1 }}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.titleView}>
                          <View style={{ flex: 1 }}><Text style={{ color: 'white', size: 20 }}>{transaction.nombre}</Text></View>
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
              })}
            </ScrollView>
          </TabView.Item>
          <TabView.Item style={{width: '100%' }}>
            <ScrollView>
              {transactions.filter((transaction) => {
                return transaction.tipo.id === 2 && transaction.nombre.toLowerCase().includes(filterText.toLowerCase())
              }).map((transaction, index) => {
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
                          navigation.navigate('TransInfo', { transaction, edit: false });
                          reset();
                        }}
                        icon={{ name: 'info', color: 'white' }}
                        buttonStyle={{ minHeight: '100%' }}
                      />
                    )}
                    rightContent={(reset) => (
                      !transaction.status && (
                        <Button
                          disabled={!hasUpdateTransRole}
                          onPress={() => {
                            console.log(transaction.id);
                            navigation.navigate('TransInfo', { transaction, edit: true });
                            reset();
                          }}
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
                    <ListItem.Content style={{ flex: 1 }}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.titleView}>
                          <View style={{ flex: 1 }}><Text style={{ color: 'white', size: 20 }}>{transaction.nombre}</Text></View>
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
              })}
            </ScrollView>
          </TabView.Item>
          <TabView.Item style={{width: '100%' }}>
            <ScrollView>
              {transactions.filter((transaction) => {
                return transaction.tipo.id === 3 && transaction.nombre.toLowerCase().includes(filterText.toLowerCase())
              }).map((transaction, index) => {
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
                          navigation.navigate('TransInfo', { transaction, edit: false });
                          reset();
                        }}
                        icon={{ name: 'info', color: 'white' }}
                        buttonStyle={{ minHeight: '100%' }}
                      />
                    )}
                    rightContent={(reset) => (
                      !transaction.status && (
                        <Button
                          disabled={!hasUpdateTransRole}
                          onPress={() => {
                            console.log(transaction.id);
                            navigation.navigate('TransInfo', { transaction, edit: true });
                            reset();
                          }}
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
                    <ListItem.Content style={{ flex: 1 }}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.titleView}>
                          <View style={{ flex: 1 }}><Text style={{ color: 'white', size: 20 }}>{transaction.nombre}</Text></View>
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
              })}
            </ScrollView>
          </TabView.Item>
        </TabView>

        <View style={{ height: 100 }}>
          <FAB
            visible={true}
            icon={{ name: 'add', color: 'white' }}
            disabled={!hasCreateTransRole}
            placement="right"
            size="large"
            color='#0D6EFD'
            onPress={() => navigation.navigate('CreateTrans', { admin: false })}
          />
        </View>
      </View>
    </>)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: '150%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingText: {
    color: '#bbb',
  },
})