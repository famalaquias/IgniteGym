/* Arquivo de conexão com o servidor, onde ficará a API */
import axios, { AxiosError, AxiosInstance } from 'axios';
import { AppError } from '@utils/AppError';

import { storageAuthTokenGet, storageAuthTokenSave } from '@storage/storageAuthToken';

type SignOut = () => void;

/* CRIANDO TIPAGEM DA FILA DE ESPERA */
type PromiseType = {
  /* requisição aceita */
  onSuccess: (token: string) => void;
  /* requisição rejeitada */
  onFailure: (error: AxiosError) => void;
}

/* TIPAGEM PARA API */
type APIInstanceProps = AxiosInstance & {
  /* função que vai gerenciar a interceptação do token na aplicação */
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
}

/* configurações de conexão com a API */
const api = axios.create({
  baseURL: 'http://192.168.15.13:3333',
}) as APIInstanceProps;

/* CRIANDO A FILA DE ESPERA */
let failedQueued: Array<PromiseType> = [];
/* solicitação de um novo token */
let isRefreshing = false;

/* CRIANDO O GERENCIADOR PARA VERIFICAR SE O TOKEN É VÁLIDO OU NÃO,
PARA ENTÃO FAZER A REQUISIÇÃO DE UM NOVO TOKEN */
api.registerInterceptTokenManager = singOut => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => response, async (requestError) => {
    /* problema relacionado a um token expirado ou inválido */
    if(requestError.response?.status === 401) {
      if(requestError.response.data?.message === 'token.expired' 
        || requestError.response.data?.message === 'token.invalid') {
          /* recuperando o refresh_token armazenado no dispositivo */
          const { refresh_token } = await storageAuthTokenGet();
          
          /* se o refresh_token não existir, desloga o usuário
          da aplicação e retorna a Promise rejeitando-a */
          if(!refresh_token) {
            singOut();
            return Promise.reject(requestError)
          }      

          /* SE O USUÁRIO REALMENTE TEM O REFRESH_TOKEN,
          COLOCA REQUISIÇÕES NA FILA DE ESPERA PARA PROCESSAR
          ESSAS REQUISIÇÕES NOVAMENTE COM O TOKEN ATUALIZADO */
          const originalRequestConfig = requestError.config;

          /* verificando se está acontecendo uma solicitação de um
          novo token */
          if(isRefreshing) {
            /* lógica de adicionar as requisições na fila */
            return new Promise((resolve, reject) => {
              /* failedQueued: fila */
              failedQueued.push({
                onSuccess: (token: string) => { 
                  /* token atualizado */
                  originalRequestConfig.headers = { 'Authorization': `Bearer ${token}` };
                  /* devolver e processar a requisição */
                  resolve(api(originalRequestConfig));
                },
                /* em caso de error: rejeite a requisição */
                onFailure: (error: AxiosError) => {
                  reject(error)
                },
              });
            });
          }

        isRefreshing = true;

        /* BUSCANDO PELO TOKEN ATUALIZADO */
        return new Promise(async (resolve, reject) => {
          try {
            /* buscando pelo novo token atualizado no backend */
            const { data } = await api.post('/sessions/refresh-token', { refresh_token });
            
            /* salvando o token atualizado */           
            await storageAuthTokenSave({ token: data.token, refresh_token: data.refresh_token });
          
            /* IMPLEMENTANDO O REENVIO DAS REQUISIÇÕES */
            /* se dentro da requisição original existir uma requisição,
            processe essa requisição novamente */
            if(originalRequestConfig.data) {
              originalRequestConfig.data = JSON.parse(originalRequestConfig.data);
            }

            /* atualize o cabeçalho das próximas requisições,
            quanto da requisição que passou por aqui */
            originalRequestConfig.headers = { 'Authorization': `Bearer ${data.token}` };
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            /* percorrer a fila de requisições, e percorra todas elas 
            processando-as */
            failedQueued.forEach(request => {
              request.onSuccess(data.token);
            });

            /* reenviando e processando as requisições */
            resolve(api(originalRequestConfig));

          } catch (error: any) {
            console.log(error);

            /* em caso de falha: pega a fila de requisições,
            percorra cada requisição que está lá dentro e use o
            método onFailure para dizer que falhou, passando o
            error */
            failedQueued.forEach(request => {
              request.onFailure(error);
            });
            
            singOut();
            reject(error);

          } finally {
            /* chegou até aqui, já tem um token atualizado */
            isRefreshing = false;
            /* limpando a fila de requisições */
            failedQueued = [];
          }
        });
      }

      /* se não houver problema com o token,
      execute a função de signOut */
      singOut();
    }

    if(requestError.response && requestError.response.data) {
      return Promise
        .reject(new AppError(requestError.response.data.message));
    } else {
      return Promise.reject(requestError);
    }
  });

  /* depois de usar o interceptors, dê uma eject nele */
  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  }
}

export { api };
