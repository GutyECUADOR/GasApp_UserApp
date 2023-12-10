import { BASE_URL } from "@env"
import axios from "axios";

const baseURL = BASE_URL;

const gasAPI = axios.create({ baseURL });

export default gasAPI;