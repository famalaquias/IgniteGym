/* Tela de Início: Login */
import { 
  Text, 
  Image, 
  VStack, 
  Center, 
  Heading,
  ScrollView,
  useToast,
} from 'native-base';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import LogoSvg from '@assets/logo.svg';
import BackgroundImg from '@assets/background.png';

import { Input } from '@components/Input';
import { Button } from '@components/Button';

import { useAuth } from '@hooks/useAuth';
import { AppError } from '@utils/AppError';
import { AuthNavigatorRoutesProps } from '@routes/auth.routes';

type FormDataProps = {
  email: string;
  password: string;
}

const schemaValidation = yup.object({
  email: yup.string().required('Cadastre um email.').email('Email inválido.'),
  password: yup.string().required('Cadastre uma senha.')
    .min(6, 'A senha deve ter pelo menos 6 dígitos.'),
});

export function SignIn() {
  /* ESTADOS - STATE */
  /* estado de loading, carregamento das informações do usuário -
  processo de autenticação do usuário */
  const [isLoading, setIsLoading] = useState(false); 

  const toast = useToast();
  const { signIn } = useAuth();
  const navigation = useNavigation<AuthNavigatorRoutesProps>();

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    resolver: yupResolver(schemaValidation),
  });

  function handleNewAccout() {
    navigation.navigate('signUp');    
  }

  async function handleSignIn({ email, password }: FormDataProps) {
    try {
      /* ativando o Loading quando o SignIn for chamado */
      setIsLoading(true);

      await signIn(email, password);
    } catch (error) {
      /* TRATAMENTO DE EXCEÇÕES - EM CASO DE ERROR:
      recuperando e exibindo as mensagens de erros do backend */
      const isAppError = error instanceof AppError; 
      const title = isAppError ? error.message : 'Não foi possível entrar. Tente novamente mais tarde.';
            
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });

      /* desativando o Loading se algo der errado e exibindo a 
      mensagem de error */
      setIsLoading(false);
    }    
  }

  return (
    /* contentContainerStyle: para a ScrollView ocupar toda a tela */
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1} px={10} pb={16}>
        <Image 
          source={BackgroundImg}
          /* defaultSource: defina a imagem padrão para carregar mais rápido */
          defaultSource={BackgroundImg}
          alt='Imagem de pessoas treinando'
          /* resizeMode: imagem se enquadra na tela */
          resizeMode="contain"
          /* position: faz com que a imagem comece do ínicio da tela */
          position="absolute"
        />      

        <Center my={24}>
          <LogoSvg />

          <Text color="gray.100" fontSize="sm">
            Treine sua mente e o seu corpo
          </Text>
        </Center>

        <Center>
          <Heading 
            color="gray.100" 
            fontSize="xl" 
            mb={6} 
            fontFamily="heading"
          >
            Acesse sua conta
          </Heading>

          <Controller 
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input 
                placeholder='E-mail' 
                /* keyboardType: teclado seja um de email */
                keyboardType="email-address"
                /* autoCapitalize: coloca todo o teclado em minusculo */
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller 
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input 
                placeholder='Senha' 
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(handleNewAccout)}
                returnKeyType="send"
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Button 
            title="Acessar"
            onPress={handleSubmit(handleSignIn)}
            isLoading={isLoading}
          />
        </Center>

        <Center mt={24}>
          <Text color="gray.100" fontSize="sm" mb={3} fontFamily="body">
            Ainda não tem acesso?
          </Text>

          <Button 
            title="Criar conta"
            variant="outline" 
            onPress={handleNewAccout}
          />
        </Center>
      </VStack>
    </ScrollView>
  );
}
