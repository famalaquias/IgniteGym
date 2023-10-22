/* NavigationContainer: contexto de navegação */
import { useTheme, Box } from 'native-base';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import { useAuth } from '@hooks/useAuth';
import { AppRoutes } from './app.routes';
import { AuthRoutes } from './auth.routes'; 

import { Loading } from '@components/Loading';

export function Routes() {
  const {colors} = useTheme();
  /* USANDO O HOOK */
  const { user, isLoadingUserStorageData } = useAuth();  

  /* DefaultTheme: traz o tema padrão do React Navigation */
  const theme = DefaultTheme;
  theme.colors.background = colors.gray[700];

  if (isLoadingUserStorageData) {
    return <Loading />
  }

  return (
    /* Box: garante que, quando navegar de uma tela para outra,
    NÃO apareça um fundo branco */
    <Box flex={1} bg="gray.700">
      <NavigationContainer theme={theme}>
        {/* Redirecionando o usuário para as rotas */}
        { user.id ? <AppRoutes /> : <AuthRoutes/> }
      </NavigationContainer>
    </Box>
  );
}
