/* Arquivo que irá armazenar o token do usuário */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AUTH_TOKEN_STORAGE } from '@storage/storageConfig';

/* TIPANDO O TOKEN */
type StorageAuthTokenProps = {
  token: string;
  refresh_token: string;
}

/* PERSISTINDO O TOKEN no dispositivo do usuário */
export async function storageAuthTokenSave({token, refresh_token}: StorageAuthTokenProps) {
  await AsyncStorage.setItem(AUTH_TOKEN_STORAGE, JSON
    .stringify({ token, refresh_token }));
}

/* BUSCANDO O TOKEN do usuário no dispositivo */
export async function storageAuthTokenGet() {
  const response = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE);

  const { token, refresh_token }: StorageAuthTokenProps = response ? 
    JSON.parse(response) : {};

  return { token, refresh_token };
}

/* REMOVENDO o token do usuário do storage */
export async function storageAuthTokenRemove() {
  await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE);
}
