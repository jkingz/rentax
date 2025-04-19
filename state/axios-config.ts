import { fetchAuthSession } from 'aws-amplify/auth';
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

axiosInstance.interceptors.request.use(async (config) => {
  const session = await fetchAuthSession();
  const { idToken } = session.tokens ?? {};

  if (idToken) {
    config.headers.Authorization = `Bearer ${idToken.toString()}`;
  }
  return config;
});
