/* Tela de Criar Conta */
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
import { useNavigation } from '@react-navigation/native';

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';

import { api } from '@services/api';
import { useAuth } from '@hooks/useAuth';
import { AppError } from '@utils/AppError';

import LogoSvg from '@assets/logo.svg';
import BackgroundImg from '@assets/background.png';

import { Input } from '@components/Input';
import { Button } from '@components/Button';

/* CRIANDO TIPAGEM PARA OS FORMULÁRIOS */
type FormDataProps = {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
}

/* SCHEMA DE VALIDAÇÃO */
const schemaValidation = yup.object({
  /* requerid: obrigatório */
  name: yup.string().required('Informe o nome do usuário.'),
  /* email: verifica se é um email válido */
  email: yup.string().required('Informe o email do usuário.').email('Email inválido.'),
  password: yup.string().required('Informe a senha do usuário.')
    .min(6, 'A senha deve ter pelo menos 6 dígitos.'),
  /* oneOf: confirma se a senha digitada é a mesma que a senha cadastrada */
  password_confirm: yup.string().required('Confirme a senha do usuário.')
    .oneOf([yup.ref('password')], 'A confirmação da senha não confere.'),
});

export function SignUp() {
  /* ESTADOS - STATE */
  /* estado para verificar se está sendo cadastrado o usuário  */
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();
  const { signIn } = useAuth();

  /* ESTADO DE VALIDAÇÃO DOS INPUTS ATRAVÉS DO USEFORM:
  pega o valor digitado pelo usuário no input */
  const { 
    control, 
    handleSubmit, 
    formState: { errors } } = useForm<FormDataProps>({
    /* USANDO O SCHEMA NA APLICAÇÃO */
    resolver: yupResolver(schemaValidation),
  });

  const navigation = useNavigation();

  /* função para voltar para tela anterior */
  function handleGoBackLogin() {
    /* goBack: volta para tela anterior */
    navigation.goBack();
  }

  /* função para obter os valores/dados do formulário dos inputs */
  async function handleSignUp({ name, email, password }: FormDataProps) {
    try {
      setIsLoading(true);

      await api.post('/users', { name, email, password });

      /* quando o usuário criar uma conta, redirecione o usuário 
      para a interface de login */  
      await signIn(email, password);
    } catch (error) {
      setIsLoading(false);
      
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível criar a conta. Tente novamente mais tarde.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
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
            Crie sua conta
          </Heading>

          <Controller 
            /* quem vai controlar o input */
            control={control}
            /* qual o nome do input */
            name="name"
            /* qual input quer renderizar */
            render={({ field: { onChange, value } }) => (
              <Input 
                placeholder='Nome' 
                /* value: pega o próprio valor do input */
                value={value}
                /* onChangeText: anota o conteúdo digitado no 
                input controlado pelo useForm e não por um estado */
                onChangeText={onChange}
                /* obtendo mensagem de erro geradas pela aplicação */
                errorMessage={errors.name?.message}
              />
            )}
          />      

          <Controller 
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input 
                placeholder='E-mail' 
                keyboardType="email-address"
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
                errorMessage={errors.password?.message}
              />
            )}
          /> 

          <Controller 
            control={control}
            name="password_confirm"
            render={({ field: { onChange, value } }) => (
              <Input 
                placeholder='Confirmar senha' 
                secureTextEntry
                value={value}
                onChangeText={onChange}
                /* configurando o botão de concluído do teclado
                para fazer envio do dados do input */
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
                errorMessage={errors.password_confirm?.message}
              />
            )}
          /> 

          <Button 
            title="Criar e acessar" 
            onPress={handleSubmit(handleSignUp)}
            isLoading={isLoading}
          />
        </Center>

        <Button 
          title="Voltar para o login" 
          variant="outline" 
          mt={12}
          onPress={handleGoBackLogin}
        />
      </VStack>
    </ScrollView>
  );
}
