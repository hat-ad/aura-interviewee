import axios from "axios";

const IP = {
  LOCAL: "http://localhost:8084/",
  DEV: "https://dev.backend.app.matrice.ai/",
};

export const BASE_URL = IP.DEV;

const instance = axios.create({
  baseURL: `${BASE_URL}`,
  timeout: 100000 * 12,
});
export const RETRY_LIMIT = 3;
export const RETRY_DELAY = 2000;

export default instance;
