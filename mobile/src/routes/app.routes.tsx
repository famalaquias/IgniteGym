/* Rotas privadas: SÓ podem ser acessadas se logar na aplicação */
import { useTheme } from 'native-base';
import { Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import HomeSvg from '@assets/home.svg';
import HistorySvg from '@assets/history.svg';
import ProfileSvg from '@assets/profile.svg';

import { Home } from '@screens/Home';
import { Profile } from '@screens/Profile';
import { History } from '@screens/History';
import { Exercise } from '@screens/Exercise';

/* tipando as rotas da aplicação, em específico */
type AppRoutes = {
  home: undefined;
  profile: undefined;
  history: undefined;
  exercise: { exerciseId: string };
}

/* tipando as rotas que precisam ser reutilizadas quando precisar */
export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutes>;

const { Navigator, Screen} = createBottomTabNavigator<AppRoutes>();

export function AppRoutes() {
  /* customizando os tamanhos e cores da aplicação */
  const { sizes, colors } = useTheme();

  /* padronizando o mesmo tamanho para TODOS os ícones */
  const iconSize = sizes[6];

  return (
    <Navigator screenOptions={{ 
      headerShown: false,
      /* tabBarShowLabel: remove a label/os nomes das páginas dos botões do Menu */
      tabBarShowLabel: false,
      /* tabBarActiveTintColor: define a cor padrão que será usada quando o Menu estiver ATIVO (selecionado) */
      tabBarActiveTintColor: colors.green[500],
      /* tabBarInactiveTintColor: define a cor padrão que será usada quando o Menu estiver INATIVO */
      tabBarInactiveTintColor: colors.gray[200],
      /* tabBarStyle: estilizando a BottonTab */
      tabBarStyle: {
        /* cor de fundo */
        backgroundColor: colors.gray[600],
        /* removendo a borda entre a página e o BottonTab */
        borderTopWidth: 0,
        /* deixando maior a altura do Menu, de acordo com o ambiente - Android ou iOS */
        height: Platform.OS === 'android' ? 'auto' : 96,
        paddingBottom: sizes[10],
        paddingTop: sizes[6],
      }
    }}>

      <Screen
        name="home"
        component={Home}
        /* estilizando dos botões de ícones */
        options={{
          tabBarIcon: ({ color }) => (
            <HomeSvg fill={color} width={iconSize} height={iconSize} />
          )
        }}
      />

      <Screen
        name="history"
        component={History}
        /* estilizando dos botões de ícones */
        options={{
          tabBarIcon: ({ color }) => (
            <HistorySvg fill={color} width={iconSize} height={iconSize} />
          )
        }}
      />

      <Screen
        name="profile"
        component={Profile}
        /* estilizando dos botões de ícones */
        options={{
          tabBarIcon: ({ color }) => (
            <ProfileSvg fill={color} width={iconSize} height={iconSize} />
          )
        }}
      />

      <Screen
        name="exercise"
        component={Exercise}
        /* ocultando/escondendo o botão(imagem) da rota de exercise */
        options={{ tabBarButton: () => null }}
      />
    </Navigator>
  );
}
