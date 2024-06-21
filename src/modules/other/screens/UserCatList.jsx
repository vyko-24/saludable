import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import Loading from '../../../kernel/Loading';
import { Input, ListItem, Button, CheckBox, FAB } from '@rneui/base';
import AxiosClient from '../../../config/http-gateway/http-client';
import { ScrollView, FlatList } from 'react-native-gesture-handler';
import Message from '../../../kernel/Message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserCatList(props) {
  const [categories, setCategories] = useState([]);
  const { navigation } = props;
  const [message, setMessage] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [visible, setVisible] = useState(false);
  const [userid, setUserid] = useState(null);
  const [rol, setRole] = useState([]);
  const [msg, setMsg] = useState('Error. Inténtelo más tarde');

  const getRol = async () => {
    const rolesString = await AsyncStorage.getItem("user");
    const rolesArray = JSON.parse(rolesString);
    setUserid(rolesArray.user.id);
    setRole(rolesArray.roles)
  }

  const buildTree = (categories) => {
    const map = {};
    const roots = [];

    categories.forEach(category => {
      map[category.id] = {
        id: category.id,
        nombre: category.nombre,
        checked: false,
        expanded: false,
        children: [],
        users: category.usuario,
        presupuesto: category.presupuesto,
        parent: category.parent,
        tipo: category.tipo
      };
    });

    categories.forEach(category => {
      if (category.parent === null) {
        roots.push(map[category.id]);
      } else {
        if (map[category.parent.id]) {
          map[category.parent.id].children.push(map[category.id]);
        }
      }
    });

    return roots;
  };

  const getCategories = async (userid) => {
    if (!userid) return;
    try {
      setVisible(true);
      const response = await AxiosClient({
        url: "/categoria/usuario/" + userid,
        method: "GET",
      });
      if (!response.error) {
        const treeData = buildTree(response.data);
        setCategories(treeData);
      }
    } catch (error) {
      console.log(error);
      if(error.response.status === 400){
        setMsg('No hay categorías registradas');
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
  };

  useEffect(() => {
    const initializeUserId = async () => {
      await getRol();
    };
    initializeUserId();
  }, []);

  useEffect(() => {
    if (userid) {
      getCategories(userid);
    }
  }, [userid]);

  useFocusEffect(
    useCallback(() => {
      if (userid) {
        getCategories(userid);
      }
    }, [userid])
  );

  const toggleCategoryExpand = (categoryId) => {
    setCategories((prevCategories) =>
      toggleExpandRecursively(prevCategories, categoryId)
    );
  };

  const toggleExpandRecursively = (categories, categoryId) => {
    return categories.map(category => {
      if (category.id === categoryId) {
        return { ...category, expanded: !category.expanded };
      } else if (category.children && category.children.length > 0) {
        return {
          ...category,
          children: toggleExpandRecursively(category.children, categoryId)
        };
      } else {
        return category;
      }
    });
  };

  const handleCategoryCheck = (categoryId) => {
    setCategories((prevCategories) =>
      checkRecursively(prevCategories, categoryId)
    );
  };

  const checkRecursively = (categories, categoryId) => {
    return categories.map(category => {
      if (category.id === categoryId) {
        return { ...category, checked: !category.checked };
      } else if (category.children && category.children.length > 0) {
        return {
          ...category,
          children: checkRecursively(category.children, categoryId)
        };
      } else {
        return category;
      }
    });
  };

  const goUpdate = async (category) => {
    setVisible(true);
    try {
      const response = await AxiosClient({
        url: '/categoria/' + category.id,
        method: 'GET'
      })
      if (response.status === 'OK') {
        const coso = response.data;
        navigation.navigate('EditCat', {category: coso });
        setVisible(false);
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

  const renderCategoryItem = (category) => (
    <View key={category.id} style={styles.categoryContainer}>
      <ListItem.Swipeable
        bottomDivider
        containerStyle={{ backgroundColor: '#3A384A' }}
        leftContent={(reset) => (
          <View style={{ flexDirection: 'row' }}>
            <Button
              disabled={!hasCreateCatRole}
              onPress={() => {
                navigation.navigate('CreateCat', {parent: category });
                reset();
              }}
              icon={{ name: 'plus', type: 'material-community', color: 'white' }}
              iconContainerStyle={{ width: 30 }}
              buttonStyle={{ minHeight: '100%', backgroundColor: 'green', width: 60 }}
            />
            <Button
            disabled={!hasEditCatRole}
              onPress={() => {
                goUpdate(category);
                reset();
              }}
              icon={{ name: 'edit', color: 'white' }}
              iconContainerStyle={{ width: 30 }}
              buttonStyle={{ minHeight: '100%', backgroundColor: 'orange', width: 60 }}
            />
          </View>
        )}
      >

        <CheckBox
          checkedIcon="menu-down"
          iconType='material-community'
          uncheckedIcon="menu-right"
          checked={category.checked}
          onPress={() => { handleCategoryCheck(category.id), toggleCategoryExpand(category.id) }}
          containerStyle={{ backgroundColor: '#3A384A', width: "5%", margin: -15 }}
          size={25}
          textStyle={styles.checkBoxText}
        />
        <ListItem.Content>
          <ListItem.Title style={{ color: '#bbb' }}>
            {category.nombre}
          </ListItem.Title>
        </ListItem.Content>
      </ListItem.Swipeable>

      {category.expanded && category.children && category.children.length > 0 && (
        <View style={styles.subcategoryContainer}>
          {category.children.map((child) => renderCategoryItem(child))}
        </View>
      )}
    </View>
  );

  console.log(rol);
  const hasCreateCatRole = rol.some(role => role.name === 'Crear Categorías');
  const hasEditCatRole = rol.some(role => role.name === 'Editar Categorías');
  
  return (
    <View style={styles.container}>
      <Loading
        visible={visible}
        title='Cargando...'
      />
      
      <Message visible={message} title={msg} />
      <ScrollView contentContainerStyle={styles.listContainer}>
        {categories.map((category) => renderCategoryItem(category))}
      </ScrollView>

      <View style={{ height: 100 }}>
        <FAB
          disabled={!hasCreateCatRole}
          visible={true}
          icon={{ name: 'add', color: 'white' }}
          placement="right"
          size="large"
          color='#0D6EFD'
          onPress={() => navigation.navigate('CreateCat', { admin: false })}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#3A384A'
  },
  listContainer: {
    paddingBottom: 20,
  },
  categoryContainer: {
    marginBottom: 20,
    backgroundColor: '#3A384A'
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  subcategoryContainer: {
    marginLeft: 20,
    marginTop: 10,
    backgroundColor: '#3A384A'
  },
  categoryHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A384A'
  },
  checkBoxContainer: {
    backgroundColor: '#3A384A',
    borderWidth: 0
  },
  checkBoxText: {
    color: '#fff',
    size: 20
  }
});