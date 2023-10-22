/* Tela de Exercise: onde ficará a explicação dos exercícios em específico */
import { 
  HStack, 
  Heading, 
  Icon, 
  Text, 
  VStack, 
  Image, 
  Box, 
  ScrollView,
  useToast,
} from 'native-base';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Feather } from '@expo/vector-icons';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';
import { AppNavigatorRoutesProps } from '@routes/app.routes';

import BodySvg from '@assets/body.svg';
import SeriesSvg from '@assets/series.svg';
import RepetitionsSvg from '@assets/repetitions.svg';

import { Button } from '@components/Button';
import { Loading } from '@components/Loading';
import { ExerciseDTO } from '@dtos/ExerciseDTO';

type RouteParamsProps = {
  exerciseId: string;
}

export function Exercise() {
  /* STATES */
  /* estado de Loading */
  const [isLoading, setIsLoading] = useState(true);
  /* estado de efetuação do registro */
  const [sendingRegister, setSendingRegister] = useState(false);
  /* estado de detalhes do exercício */
  const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO);

  const toast = useToast();
  const navigation = useNavigation<AppNavigatorRoutesProps>();

  const route = useRoute();
  const { exerciseId } = route.params as RouteParamsProps; 

  /* FUNÇÕES */
  /* implementando a função de voltar do ícone arrow-left */
  function handleGoBack() {
    navigation.goBack();
  }

  /* buscando os detalhes dos exercícios selecionados no backend */
  async function fetchExerciseDetails() {
    try {
      setIsLoading(true);
      /* buscando os exercícios (informações) do backend */
      const response = await api.get(`/exercises/${exerciseId}`);
      /* exibindo as informações */
      setExercise(response.data);
      
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível carregar os detalhes do exercício.';
      
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });      
    } finally {
      setIsLoading(false);
    }
  }

  /* marcando o exercício como realizado */
  async function handleExerciseHistoryRegister() {
    try {
      setSendingRegister(true);
      await api.post('/history', { exercise_id: exerciseId });

      toast.show({
        title: 'Parabéns! Exercício registrado no seu histórico.',
        placement: 'top',
        bgColor: 'green.500'
      });  

      navigation.navigate('history');
      
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível registrar o exercício.';
      
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });      
    } finally {
      setSendingRegister(false);
    }
  }

  useEffect(() => {
    fetchExerciseDetails();
  }, [exerciseId]);

  return (
    <VStack flex={1}>
      {/* HEADER DA TELA DE EXERCISE */}
      <VStack px={8} bg="gray.600" pt={12}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon as={Feather} name="arrow-left" color="green.500" size={6} />
        </TouchableOpacity>

        {/* Adicionando título do exercício no cabeçalho da tela */}
        <HStack justifyContent="space-between" mt={4} mb={8} alignItems="center">
          <Heading color="gray.100" fontSize="lg" flexShrink={1} fontFamily="heading">
            {exercise.name}
          </Heading>

          <HStack alignItems="center">
            <BodySvg />
            <Text color="gray.200" ml={1} textTransform="capitalize">
              {exercise.group}
            </Text>
          </HStack>
        </HStack>
      </VStack>

      <ScrollView>
        {
          isLoading ? <Loading /> :
            <VStack p={8}> 
              <Box rounded="lg" mb={3} overflow="hidden">
                <Image
                  w="full"
                  h={80}
                  source={{
                    uri: `${api.defaults.baseURL}/exercise/demo/${exercise?.demo}`,
                    }}
                  alt="Nome do exercício"
                  resizeMode="cover"
                  rounded="lg"
                />
              </Box>
          
              <Box bg="gray.600" rounded="md" pb={4} px={4}>
                <HStack alignItems="center" justifyContent="space-around" mb={6} mt={5}>
                  <HStack>
                    <SeriesSvg />
                      <Text color="gray.200" ml="2">
                        {exercise.series} séries
                      </Text>
                  </HStack>

                  <HStack>
                    <RepetitionsSvg />
                    <Text color="gray.200" ml="2">
                      {exercise.repetitions} repetições
                    </Text>
                  </HStack>
                </HStack>

                <Button 
                  title="Marcar como realizado" 
                  isLoading={sendingRegister}
                  onPress={handleExerciseHistoryRegister}
                />
              </Box>        
            </VStack>
          }
      </ScrollView>
    </VStack>
  );
}
