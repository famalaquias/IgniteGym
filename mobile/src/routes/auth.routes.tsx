/* Rotas públicas: podem ser acessadas sem logar na aplicação */
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SignIn } from '@screens/SignIn';
import { SignUp } from '@screens/SignUp';

/* tipando as rotas da aplicação, em específico */
type AuthRoutes = {
  /* undefined: porque não tem parâmetro nenhum a ser passado */
  signIn: undefined;
  signUp: undefined;
}

/* tipando as rotas que precisam ser reutilizadas quando precisar */
export type AuthNavigatorRoutesProps = NativeStackNavigationProp<AuthRoutes>;

const { Navigator, Screen} = createNativeStackNavigator<AuthRoutes>();

export function AuthRoutes() {
  return (
    /* screenOptions: remove o Header - cabeçalho */
    <Navigator screenOptions={{ headerShown: false }}>
      <Screen
        name="signIn"
        component={SignIn}
      />
      <Screen
        name="signUp"
        component={SignUp}
      />
    </Navigator>
  );
}
