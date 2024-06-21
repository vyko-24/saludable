import React from 'react';
import {View, StyleSheet, Text, ActivityIndicator} from 'react-native';
import { Overlay } from '@rneui/base';
import { CardTitle } from '@rneui/base/dist/Card/Card.Title';

export default function Loading(props){
    const {visible, title} = props;
    return (
        <Overlay isVisible={visible}
        windowsBackgroundColor='rgb(0, 0, 0, 0.5)'
        OverlayBackgroundColor='transparent'
        overlayStyle={styles.overlay}
        >
        <View>
            <ActivityIndicator size='large' color="#0D6EFD"/>
            <Text style={styles.title}>{title}</Text>
        </View>
        </Overlay>
    );
}

const styles = StyleSheet.create({
    overlay:{
        height: 150,
        width: 250,
        backgroundColor: '#3A384A',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title:{
        color: '#d9d9d9',
        textTransform: 'uppercase',
        marginTop: 16,
        textAlign: 'center'
    }
})