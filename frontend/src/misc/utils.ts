import axios from "axios"
import { config } from "./constants"
import moment from "moment"
import { store } from "../store"
import { refreshToken } from "../features/authSlice"

export const axiosPublic = axios.create({
  baseURL: config.url.API_BASE_URL
})

export const axiosPrivate = axios.create({
  baseURL: config.url.API_BASE_URL
})

axiosPrivate.interceptors.request.use(
  async (config) => {
    const authState = store?.getState()?.auth?.user
    console.log(authState?.expiresAt)
    if (authState?.expiresAt) {

      if (authState?.expiresAt - moment.now() < 10) {
        await store.dispatch(refreshToken());
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);