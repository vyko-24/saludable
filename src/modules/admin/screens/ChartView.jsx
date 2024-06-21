import { StyleSheet, Text, View, } from 'react-native'
import React, { useState, useEffect, useCallback, } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import Loading from '../../../kernel/Loading';
import AxiosClient from '../../../config/http-gateway/http-client';
import { ScrollView } from 'react-native-gesture-handler';
import Message from '../../../kernel/Message';
import {
    BarChart, PieChart
} from "react-native-chart-kit";
import { Dimensions } from "react-native";
const screenWidth = Dimensions.get("window").width;

export default function ChartView(props) {
    const { navigation } = props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dataReady, setDataReady] = useState(false);
    const [categoryLabels, setCategoryLabels] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [dataPie, setDataPie] = useState([]);

    const getTransactions = async () => {
        try {
            setVisible(true);
            const response = await AxiosClient({
                url: "/transaccion/status/1",
                method: "GET",
            });
            if (!response.error) {
                setTransactions(response.data);
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

    const getCategories = async () => {
        try {
            setVisible(true);
            const response = await AxiosClient({
                url: "/categoria/",
                method: "GET",
            });
            if (!response.error) {
                setCategories(response.data);
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

    useFocusEffect(
        useCallback(() => {
            getCategories();
            getTransactions();
        }, [])
    );

    useEffect(() => {
        getTransactions();
        getCategories();
    }, []);

    useEffect(() => {
        if (transactions.length && categories.length) {
            processDataForCharts();
        }
    }, []);

    const processDataForCharts = () => {
        setVisible(true);
        const labels = categories.map(category => category.nombre);
        const data = Array(categories.length).fill(0);

        transactions.forEach(transaction => {
            const categoryId = transaction.categoria.id;
            const transactionAmount = transaction.monto;
            const categoryIndex = categories.findIndex(category => category.id === categoryId);
            if (categoryIndex !== -1 && !isNaN(transactionAmount)) {
                data[categoryIndex] += transactionAmount;
            }
        });

        setCategoryLabels(labels);
        setCategoryData(data);
        setDataReady(true); 

        const pieData = categories.map((category, index) => ({
            name: category.nombre,
            population: data[index],
            color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`,
            legendFontColor: "#FFF",
            legendFontSize: 15
        }));

        setDataPie(pieData);
        setVisible(false);
    };

    return (
        <ScrollView style={styles.container} >
            <Loading
                visible={visible || !dataReady}
                title='Cargando...'
            />
            <Message visible={message} title='Error. inténtelo más tarde' />
            {dataReady && (
                <>
                    <ScrollView horizontal={true}>
                        {categoryData.every(data => !isNaN(data)) && (
                            <BarChart
                                data={{
                                    labels: categoryLabels,
                                    datasets: [
                                        {
                                            data: categoryData
                                        }
                                    ]
                                }}
                                width={screenWidth * 1.5} // Ajusta el ancho del gráfico
                                height={220}
                                yAxisInterval={1}
                                chartConfig={{
                                    backgroundGradientFrom: "#3A384A",
                                    backgroundGradientTo: "#3A384A",
                                    decimalPlaces: 2,
                                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                    style: {
                                        borderRadius: 16,
                                    },
                                    propsForDots: {
                                        r: "6",
                                        strokeWidth: "2",
                                        stroke: "#3A384A"
                                    }
                                }}
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                    borderColor: `rgba(255, 255, 255, 1)`,
                                    borderWidth: 1
                                }}
                            />
                        )}
                    </ScrollView>
                {dataPie.length > 0 && categoryData.every(data => !isNaN(data)) && (
                    <PieChart
                        data={dataPie}
                        width={screenWidth}
                        height={220}
                        backgroundColor={"transparent"}
                        center={[0, 20]}
                        absolute
                        chartConfig ={ {
                            backgroundGradientFrom: "#1E2923",
                            backgroundGradientFromOpacity: 0,
                            backgroundGradientTo: "#08130D",
                            backgroundGradientToOpacity: 0.5,
                            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                            strokeWidth: 2,
                            barPercentage: 0.5,
                            useShadowColorFromDataset: false
                          }}
                        accessor={"population"}
                    />
                )}
                </>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#3A384A',
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