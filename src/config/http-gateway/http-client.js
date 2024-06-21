import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
console.log("API_URL",API_URL);


const AxiosClient = axios.create({
    baseURL: API_URL,
    withCredentials:false
});

const requestHandler = async (request) => {
    request.headers["Accept"] = "application/json";
    request.headers["Content-Type"] = "application/json";
    
    const session = JSON.parse(await AsyncStorage.getItem("user") || null);
   
    if (session?.token) {
        request.headers["Authorization"] = `Bearer ${session.token}`;
    }
    
    return request;
};

AxiosClient.interceptors.request.use(
    (req) => requestHandler(req),
    (err) => Promise.reject(err),
);

AxiosClient.interceptors.response.use(
    (res) => Promise.resolve(res.data),
    (err) => Promise.reject(err),
);

export default AxiosClient;
