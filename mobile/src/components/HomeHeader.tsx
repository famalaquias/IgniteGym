import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { HStack, Text, Heading, VStack, Icon } from 'native-base';

import { api } from '@services/api';
import { useAuth } from '@hooks/useAuth';

import { UserPhoto } from './UserPhoto';
import defaultUserPhotoImg from '@assets/userPhotoDefault.png';

export function HomeHeader() {
  /* acessando os dados do usuário criado no contexto */
  const { user, signOut } = useAuth();

  return (
    /* HStack: é um componente de layout que tem como objetivo
    posicionar os elementos em linha (horizontal) */
    /* pt: espaçamento interno acima;
    pb: espaçamento interno abaixo 
    px: dos lados, na horizontal*/
    <HStack bg="gray.600" pt={16} pb={5} px={8} alignItems="center"> 
      <UserPhoto 
        source={
          user.avatar  
          ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } 
          : defaultUserPhotoImg
        }
        alt='Imagem do perfil do github'
        size={16} 
        mr={4}
      /> 

      {/* VStack: é um componente de layout que tem como objetivo
      posicionar os elementos em colunas (vertical) */}
      <VStack flex={1}>
        <Text color="gray.100" fontSize="md" fontFamily="body">
          Olá,
        </Text>

        <Heading color="gray.100" fontSize="md" fontFamily="heading">
          {/* nome do usuário autenticado */}
          {user.name}
        </Heading>
      </VStack>

      {/* TouchableOpacity: é um botão */}
      <TouchableOpacity onPress={signOut}>
        {/* Icon: é necessário usar essa propriedade do nativeBase
        para fazer a imagem aparecer */}
        <Icon 
          /* diz qual a biblioteca quero usar */
          as={MaterialIcons}
          name="logout"
          color="gray.200"
          size={7}
        />
      </TouchableOpacity>
    </HStack>  
  );
}
