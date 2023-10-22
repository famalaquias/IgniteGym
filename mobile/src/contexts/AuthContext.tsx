import { ReactNode, createContext, useEffect, useState } from 'react';

import { api } from '@services/api';
import { UserDTO } from '@dtos/UserDTO';

import { storageAuthTokenSave, storageAuthTokenGet, storageAuthTokenRemove } from '@storage/storageAuthToken';
import { storageUserSave, storageUserGet, storageUserRemove } from '@storage/storageUser';

/* TIPO DO CONTEXTO */
export type AuthContextDataProps = {
  user : UserDTO;
  signIn: (email: string, password: string) => Promise<void>;
  updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
  signOut: () => Promise<void>;
  isLoadingUserStorageData: boolean;
}

/* TIPAGEM DO COMPONENTE FILHO - CHILDREN */
type AuthContextProviderProps = {
  /* ReactNode: componente do React */
  children: ReactNode;
}

/* CRIANDO CONTEXTOS - CREATECONTEXT */
export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

/* Traz o PROVEDOR DO CONTEXTO do arquivo App.tsx, para cá */
export function AuthContextProvider({ children }: AuthContextProviderProps) {
  /* ESTADOS -STATE: */
  /* criando o estado para guardar as informações do usuário */
  const [user, setUser] = useState<UserDTO>({} as UserDTO);
  /* criando o estado para anotar se as informações do usuário
  ainda estão sendo consultadas, ou seja, se está sendo buscada;
  ai podemos aguardar a leitura desses dados no dispositivo 
  enquanto isso deixa um indicador de Loading(Carregando) */
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true);

  /* FUNÇÕES */
  /* salvando as informações do token no dispositivo E anexando o 
  token nas requisições */
  async function userAndTokenUpdate(userData: UserDTO, token: string) {
    /* salvando/anexando a informação do token no cabeçalho */
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    /* atualizando os dados do usuário autenticado */
    setUser(userData);   
  }

  /* salvando no storage o usuário e o token */
  async function storageUserAndTokenSave(userData: UserDTO, token: string, refresh_token: string) {
    try {
      setIsLoadingUserStorageData(true);

      /* salvando os dados do usuário e o token no dispositivo */
      /* persistindo/salvando os dados e o token do usuário */
      await storageUserSave(userData);
      await storageAuthTokenSave({ token, refresh_token });

    } catch (error) {
      throw error;

    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  /* signIn: PERMITE QUE O USUÁRIO ACESSE A APLICAÇÃO:
  responsável por receber o email e a senha do usuário e atualizar
  os dados dele no estado do contexto */
  async function signIn(email: string, password: string) {
    try {
      /* buscando as informações do usuário pelo backend */
      const { data } = await api.post('/sessions', { email, password });   

      /* se existir os dados do usuário e o o token do usuário,
      atualize-os de acordo com os dados retornados do backend */
      if(data.user && data.token && data.refresh_token) {
        await storageUserAndTokenSave(data.user, data.token, data.refresh_token);
        userAndTokenUpdate(data.user, data.token)
      }     
    } catch (error) {
      throw error;    

    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  /* signOut: PERMITE QUE O USUÁRIO SAIA DA APLICAÇÃO */
  async function signOut() {
    try {
      /* ativa o Loading, pois vai apagar os dados */
      setIsLoadingUserStorageData(true);

      /* atualizando o estado para um objeto vazio (não tem mais
      um usuário) */
      setUser({} as UserDTO);

      /* remove o dados do usuário do storage */
      await storageUserRemove();

      /* remove o token do usuário do storage */
      await storageAuthTokenRemove();

    } catch (error) {
      throw error; 
    } finally {
      /* desativando o Loading */
      setIsLoadingUserStorageData(false);
    }
  }

  /* updateUserProfile: ATUALIZA O ESTADO USER */
  async function updateUserProfile(userUpdated: UserDTO) {
    try {
      /* setando os dados do usuário atualizado no estado */
      setUser(userUpdated);
      /* salvando os dados atualizado no dispositivo */
      await storageUserSave(userUpdated);
    } catch (error) {
      throw error;
    }
  }

  /* loadUserData: responsável por recuperar os dados do usuário
  logado e atualizar seu estado */
  async function loadUserData() {
    try {
      setIsLoadingUserStorageData(true);

      /* Recuperando o usuário que está logado */
      const userLogged = await storageUserGet();

      /* buscando o token do usuário */
      const { token } = await storageAuthTokenGet();

      /* se o token existe E o usuário está logado, atualiza o 
      estado do usuário */
      if (token && userLogged) {
        userAndTokenUpdate(userLogged, token);
      }      

    } catch (error) {
      throw error;

    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  useEffect(() => {
    /* busca no dispositivo se o usuário está logado e o leva para
    as rotas da aplicação */
    loadUserData();
  }, []);

  /* registrando a função registerInterceptTokenManager na API */
  useEffect(() => {
    const subscribe = api.registerInterceptTokenManager(signOut);

    /* e limpando essa função da memória */
    return () => {
      subscribe();
    }
  },[]);

  return(
    <AuthContext.Provider value={{ 
      user, 
      signIn, 
      signOut,
      updateUserProfile,
      isLoadingUserStorageData,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
