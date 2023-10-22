/* Tela de Home: onde ficará a ficha de exercícios */
import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { 
  VStack, 
  FlatList, 
  HStack, 
  Heading, 
  Text,
  useToast,
} from 'native-base';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';

import { ExerciseDTO } from '@dtos/ExerciseDTO';
import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { Loading } from '@components/Loading';
import { HomeHeader } from '@components/HomeHeader';
import { ExerciseCard } from '@components/ExerciseCard';
import { GroupExercise } from '@components/GroupExercise';

export function Home() {
  /* STATES: */
  /* estado de Loading */
  const [isLoading, setIsLoading] = useState(true);
  /* estado inicial dos grupos de exercícios */
  const [groups, setGroups] = useState<string[]>([]);
  /* estado do isActive - qual grupo está ativo */
  const [groupIsActive, setGroupIsActive] = useState('antebraço');
  /* estado que  irá auxiliar na listagem de exercícios */
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);

  const toast = useToast();
  const navigation = useNavigation<AppNavigatorRoutesProps>();

  /* FUNÇÕES */
  /* handleOpenExercisesDetails: abrindo os exercícios em uma nova
  página, onde ficará os exercícios detalhados */
  function handleOpenExercisesDetails(exerciseId: string) {
    navigation.navigate('exercise', { exerciseId });        
  }

  /* LISTANDO E BUSCANDO AS INFORMAÇÕES DOS GRUPOS DE EXERCÍCIOS */
  async function fetchGroups() {
    try {
      /* buscando os grupos do backend */
      const response = await api.get('/groups');
      setGroups(response.data);
      
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível carregar os grupos musculares.';
      
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    }
  }

  /* BUSCANDO OS EXERCÍCIOS POR GRUPO */
  async function fetchExercisesByGroup() {
    try {
      setIsLoading(true);

      /* buscando os exercícios do backend */
      const response = await api.get(`/exercises/bygroup/${groupIsActive}`);
      
      setExercises(response.data);
      
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível carregar os exercícios.';
      
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  /* toda vez que o groupIsActive mudar, dispara novamente a busca
  e traz os exercícios do grupo selecionado */
  useFocusEffect(useCallback(() => {
    fetchExercisesByGroup();
  }, [groupIsActive]));

  return (
    <VStack flex={1}>
      <HomeHeader />

      {/* FlatList: usada para exibir os grupos de exercícios */}
      <FlatList 
        data={groups}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <GroupExercise 
            name={item}
            isActive={groupIsActive === item}
            /* função que atualiza o estado do grupo selecionado */
            onPress={() => setGroupIsActive(item)}
          />         
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        _contentContainerStyle={{ px: 8 }}
        my={10}
        maxHeight={10}
        minHeight={10}
      />

      {
        isLoading ? <Loading /> :
          <VStack flex={1} px={8}>
            <HStack justifyContent="space-between" mb={5}>
              <Heading color="gray.200" fontSize="md" fontFamily="heading">
                Exercícios
              </Heading>

              <Text color="gray.200" fontSize="sm">
                {/* Quantidade de exercícios  */}
                {exercises.length}
              </Text>
            </HStack>

            {/* FlatList: usada para exibir a listagem de exercícios */}
            <FlatList
              data={exercises}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <ExerciseCard 
                  data={item}
                  /* passando o ID do exercício selecionado */
                  onPress={() => handleOpenExercisesDetails(item.id)}
                /> 
              )}    
              showsVerticalScrollIndicator={false}
              _contentContainerStyle={{ paddingBottom: 20 }}
            />
          </VStack>
        }
    </VStack>
  );
}
