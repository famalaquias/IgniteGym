/* centralizando a persistência dos dados relacionados ao usuário */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { UserDTO } from '@dtos/UserDTO';
import { USER_STORAGE } from '@storage/storageConfig';

/* SALVANDO os dados do usuário no storage */
export async function storageUserSave(user: UserDTO) {
  /* setasync function storageUserSave(user: UserDTO) {Item: armazena as informaçoes no dispositivo do usuário;
  possui dois parâmetros: chave única (key); o que quer guardar */
  await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
}

/* BUSCANDO os dados do usuário no storage - carregando as 
informações do usuário que está no dispositivo para atualizar o 
estado */
export async function storageUserGet() {
  /* pega os dados do AsyncStorage através do método getItem */
  const storage = await AsyncStorage.getItem(USER_STORAGE);

  const user: UserDTO = storage ? JSON.parse(storage) : {};

  return user;
}

/* REMOVENDO o usuário logado do storage */
export async function storageUserRemove() {
  const storage = await AsyncStorage.removeItem(USER_STORAGE);
}
