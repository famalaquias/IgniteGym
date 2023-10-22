/* Tela de Profile: onde ficará o perfil do usuário cadastrado */
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { 
  Center, 
  ScrollView, 
  VStack, 
  Skeleton, 
  Text, 
  Heading, 
  useToast,
} from 'native-base';
import { Controller, useForm } from 'react-hook-form';

import { api } from '@services/api';
import { useAuth } from '@hooks/useAuth';
import { AppError } from '@utils/AppError';

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import defaulUserPhotoImg from '@assets/userPhotoDefault.png'; 

import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { UserPhoto } from '@components/UserPhoto';
import { ScreenHeader } from '@components/ScreenHeader';

const PHOTO_SIZE = 33;

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  old_password: string;
  confirm_password: string;
}

/* SCHEMA DE VALIDAÇÃO */
const profileSchema = yup.object({
  name: yup
    .string()
    .required('Informe o nome.'),

  password: yup
    .string()
    .min(6, 'A senha deve ter pelo menos 6 dígitos.')
    .nullable()
    .transform((value) => value || null),

  confirm_password: yup
    .string()
    .nullable()
    .transform((value) => value || null)
    .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere.')
    .when('password', {
      is: (Field: any) => Field,
      then: (schema) =>
        schema
          .nullable()
          .required('Informe a confirmação da senha.')
          .transform((value) => value || null),
    }),
});

export function Profile() {
  /* STATES */
  /* estado para notar se está enviando a requisição para o backend */
  const [isUpdating, setIsUpdating] = useState(false);
  /* estado inicial do loading da foto - Skeleton */
  const [photoIsLoading, setPhotoIsLoading] = useState(false);

  /* Personalizando mensagens de alerta */
  const toast = useToast();
  const { user, updateUserProfile } = useAuth();

  /* acessando as informações do usuário logado */
  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({ 
    defaultValues: { 
      name: user.name,
      email: user.email
    },
    resolver: yupResolver(profileSchema),
  });

  /* FUNÇÕES */
  /* handleUserPhotoSelect: função assíncrona, o processo de 
  selecionar foto pode levar algum tempo; */
  async function handleUserPhotoSelect() {
    /* criando um estado de loading caso a foto esteja sendo selecionada */
    setPhotoIsLoading(false);

    try {
      /* photoSelected: recuperando as informações da imagem que 
      selecionamos; 
      launchImageLibraryAsync: para acessar o álbum do usuário */
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        /* mediaTypes: tipo de conteúdo que quer selecionar da galeria
        do usuário */
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        /* quality: qualidade da imagem */
        quality: 1,
        /* aspect: aspecto da imagem */
        aspect: [4, 4],
        /* allowsEditing: opção para usuário poder editar a imagem */
        allowsEditing: true,
      });

      /* se o usuário cancelou a foto, significa que ele não selecionou uma foto */
      if (photoSelected.canceled) {
        return;
      }

      /* garantindo que a imagem tenha uma uri */
      if (photoSelected.assets[0].uri) {
        /* limitando o tamanho da imagem através do FileSystem */
        const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri);
        
        /* convertendo o tamanho de bytes para megabytes */
        if(photoInfo.exists && (photoInfo.size  / 1024 / 1024 ) > 5){
          return toast.show({
            title: "Essa imagem é muito grande. Escolha uma de até 5MB.",
            /* placement: onde quer que a mensagem apareça na tela */
            placement: "top",
            /* cor de fundo da mensagem de error */
            bg: "red.500"
          });
        }

        /* enviando as informações para o backend;
        pegando a extensão da imagem,  */
        const fileExtension = photoSelected.assets[0].uri.split('.').pop();
        
        /* definindo as informações que a imagem precisa ter para
        o upload */
        const photoFile = {
          name: `${user.name}.${fileExtension}`.toLowerCase(),
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`
        } as any;
        
        /* enviando as informações para o backend via formulário */
        const userPhotoUploadForm = new FormData();
        /* anexando as informações, enviando o arquivo photoFile
        via nome avatar */
        userPhotoUploadForm.append('avatar', photoFile);

        /* patch: atualizando um campo específico através do
        forumulário userPhotoUploadForm */
        const avatarUpdtedResponse = await api
        .patch('/users/avatar', userPhotoUploadForm, {
          headers: {
             /* conteúdo que quer enviar, não é mais um JSON */
            'Content-Type': 'multipart/form-data'
          }
        });

        /* atualizando o upload dentro da aplicação */
        const userUpdated = user;
        /* selecionando uma nova foto e atualizando na aplicação */
        userUpdated.avatar = avatarUpdtedResponse.data.avatar;

        await updateUserProfile(userUpdated);

        toast.show({
          title: 'Foto atualizada!',
          placement: 'top',
          bgColor: 'green.500'
        });

      }

    } catch (error) {
      console.log(error);      
    } finally {
      setPhotoIsLoading(false);
    }
  }

  /* handleUserPhotoSelect: função assíncrona de atualização dos
  dados de perfil do usuário */
  async function handleProfileUpdate(data: FormDataProps) {
    try {
      /* setando os dados atualizados */
      setIsUpdating(true);

      const userUpdated = user;
      userUpdated.name = data.name;

      /* put: requisição para atualizar os dados;
      data: é os dados que serão atualizados: name, password(senha
      atual) e old_password(senha antiga) */
      await api.put('/users', data);

      /* dados do usuário atualizado */
      await updateUserProfile(userUpdated);

      toast.show({
        title: 'Perfil atualizado com sucesso!',
        placement: 'top',
        bgColor: 'green.500'
      });

    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível atualizar os dados. Tente novamente mais tarde.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      });

    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />

      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt={6} px={10}>
          {
            photoIsLoading ? 
              /* Skeleton: feedback de loading para a imagem, 
              enquanto a imagem ainda não foi carregada */
              <Skeleton 
                w={PHOTO_SIZE} 
                h={PHOTO_SIZE} 
                rounded="full" 
                startColor="gray.500"
                endColor="gray.400"
              />

              :

              <UserPhoto 
                source={
                  user.avatar  
                  ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } 
                  : defaulUserPhotoImg
                }
                alt='Imagem do perfil do github'
                size={PHOTO_SIZE} 
              />
          }

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color="green.500" fontWeight="bold" fontSize="md" mt={2} mb={8}>
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Controller 
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <Input 
                placeholder="Nome"
                bg="gray.600"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller 
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <Input 
                placeholder="E-mail"
                isDisabled
                bg="gray.600"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading color="gray.200" fontSize="md" mb={2} fontFamily="heading">
            Alterar senha
          </Heading>

          <Controller 
            control={control}
            name="old_password"
            render={({ field: { onChange } }) => (
              <Input 
                placeholder="Senha antiga"
                secureTextEntry
                bg="gray.600"
                onChangeText={onChange}
              />
            )}
          />

          <Controller 
            control={control}
            name="password"
            render={({ field: { onChange } }) => (
              <Input 
                placeholder="Nova senha"
                secureTextEntry
                bg="gray.600"
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller 
            control={control}
            name="confirm_password"
            render={({ field: { onChange } }) => (
              <Input 
                placeholder="Confirme a nova senha"
                secureTextEntry
                bg="gray.600"
                onChangeText={onChange}
                errorMessage={errors.confirm_password?.message}
              />
            )}
          />

          <Button 
            title="Atualizar" 
            mt={4}
            onPress={handleSubmit(handleProfileUpdate)}
            /* definindo a atualização */
            isLoading={isUpdating}
          />
        </VStack>
      </ScrollView>
    </VStack>
  );
}
