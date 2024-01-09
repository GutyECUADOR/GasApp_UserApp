import { BASE_URL } from "@env"
import axios from "axios";

const baseURL = 'https://pideteungas.com';

const gasAPI = axios.create({ baseURL });

export default gasAPI;