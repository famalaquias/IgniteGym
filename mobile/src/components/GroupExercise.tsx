import { Text, Pressable, IPressableProps } from 'native-base';

/* criando as tipagens do grupo */
type Props = IPressableProps & {
  name: string;
  /* indica o grupo que está selecionado no momento */
  isActive?: boolean;
}

export function GroupExercise({ name, isActive, ...rest }: Props) {
  return (
    <Pressable
      /* mr: margem lado esquerdo */
      mr={3}
      w={24}
      h={10}
      bg="gray.600"
      rounded="md"
      alignItems="center"
      justifyContent="center"
      /* overflow: coloca o conteúdo dentro do espaço do botão */
      overflow="hidden"
      /* isPressed: botão que está presionado */
      isPressed={isActive}
      /* _pressed: muda o visual do pressable quando ele for selecionado */
      _pressed={{
        borderColor: "green.500",
        borderWidth: 1,
      }}
      {...rest}
    >
      <Text 
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
        color={isActive ? "green.500" : "gray.200"}
      >
        {name}
      </Text>
    </Pressable>
  );
}
