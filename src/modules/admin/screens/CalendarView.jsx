import { StyleSheet, Text, View, FlatList, Vibration, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import Loading from '../../../kernel/Loading';
import { Input, ListItem, Button, CheckBox, FAB, Icon, Dialog, SpeedDial, Divider } from '@rneui/base';
import AxiosClient from '../../../config/http-gateway/http-client';
import { ScrollView } from 'react-native-gesture-handler';
import Message from '../../../kernel/Message';
import { Calendar, CalendarList, Agenda, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ],
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado'],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Miér.', 'Jue.', 'Vie.', 'Sab.'],
  today: "Hoy"
};

LocaleConfig.defaultLocale = 'es';

export default function CalendarView(props) {
  const { navigation } = props;
  const [selected, setSelected] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  const getTransactions = async () => {
    setVisible(true);
    try {
      const response = await AxiosClient({
        url: '/transaccion/',
        method: 'GET'
      })
      if (response.status === 'OK') {
        const sorted = response.data.slice().sort((a, b) => b.fecha.localeCompare(a.fecha));
        setTransactions(sorted);
        markDates(sorted);
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
  }

  const markDates = (transactions) => {
    const dates = {};
    transactions.forEach(transaction => {
      const date = transaction.fecha.split('T')[0];
      if (!dates[date]) {
        dates[date] = { marked: true, dotColor: 'blue' };
      }
    });
    setMarkedDates(dates);
  };

  useEffect(() => {
    getTransactions();
  }, []);

  const [transactionsForDate, setTransactionsForDate] = useState([]);

  const showTransactionsForDate = (date) => {
    const transactionsForSelectedDate = transactions.filter(transaction =>
      transaction.fecha.startsWith(date)
    );
    setTransactionsForDate(transactionsForSelectedDate);
  };

  const formatMoney = (amount) => {
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  const renderTransaction = ({ item }) => {
    const colors = item.tipo.nombre === 'Transferencia' ? (
      '#0D6EFD'
    ) : (item.tipo.nombre === 'Ingreso' ? '#3BCE5E' : '#EF5350'
    );
    return (<>
      <TouchableOpacity style={styles.titleView}
      onl
      onLongPress={() => {
        Vibration.vibrate(50);
        navigation.navigate('TransInfo', { transaction:item, edit: false, admin: true });
    }}
      >
        <View style={{ flex: 1 }}><Text style={{ color: 'white', size: 20 }}>{item.nombre}</Text></View>
        <View style={{ flex: 1 }}><Text style={{ color: colors }}>$ {formatMoney(item.monto)}</Text></View>
      </TouchableOpacity>
      <Divider style={{ marginBottom: 20 }} width={1.2} insetType="middle" color='#86939E' />
    </>)
  };

  return (
    <View style={styles.container}>
      <Loading
        visible={visible}
        title='Cargando...'
      />
      <Message visible={message} title='Error. inténtelo más tarde' />
      <Calendar
        style={{
          borderWidth: 1,
          borderColor: '#86939E',
          height: 400,
          width: 350,
          borderRadius: 20,
        }}
        theme={{
          backgroundColor: '#3A384A',
          calendarBackground: '#3A384A',
          textSectionTitleColor: '#d9e1e8',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#3A384A',
          todayTextColor: '#00adf5',
          dayTextColor: '#d9e1e8',
          textDisabledColor: '#ddd',
          arrowColor: '#00adf5',
          disabledArrowColor: '#ddd',
          monthTextColor: '#00adf5',
          indicatorColor: '#00adf5',
          textDayFontFamily: 'monospace',
          textMonthFontFamily: 'monospace',
          textDayHeaderFontFamily: 'monospace',
          textDayFontWeight: '300',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
          selectedDotColor:'orange'
        }}
        onDayPress={day => {
          setSelected(day.dateString);
          showTransactionsForDate(day.dateString);
        }}
        markedDates={{
          ...markedDates,
          [selected]: { selected: true, disableTouchEvent: true, selectedDotColor: 'orange' }
        }}
      />
      {
        selected && transactionsForDate.length > 0 && (
          <FlatList
            data={transactionsForDate}
            renderItem={renderTransaction}
            keyExtractor={item => item.id.toString()}
            style={styles.transactionList}
          />
        )
      }
      {
        selected && transactionsForDate.length === 0 && (
          <Text style={styles.noTransactionText}>No hay transacciones para esta fecha.</Text>
        )
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#3A384A'
  },
  calendar: {
    borderWidth: 1,
    borderColor: 'gray',
    height: 400,
    width: 350,
    borderRadius: 20,
  },
  text: {
    color: '#fff',
    marginHorizontal: 10
  },
  transactionList: {
    marginTop: 20,
  },
  transactionItem: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  transactionText: {
    color: '#fff',
  },
  noTransactionText: {
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  titleView: {
    flex: 1,
    width: '150%',
    height: 25,
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
});
