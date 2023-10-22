/* CRIANDO O PRÓPRIO HOOK PARA COMPARTILHAR DE FORMA SIMPLIDICADA
O NOSSO CONTEXTO */
import { useContext } from 'react';
import { AuthContext} from '@contexts/AuthContext';

export function useAuth() {
  /* USANDO O CONTEXTO */
  const context = useContext(AuthContext);

  return context;
}
