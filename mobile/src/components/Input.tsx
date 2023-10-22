import { Input as NativeBaseInput, IInputProps, FormControl } from 'native-base';

/* estilizando as mensagens de validação de erros do input */
type Props = IInputProps & {
  errorMessage?: string | null;
}

/* errorMessage = null: caso o error não seja informado, ele será
nullo */
export function Input({ errorMessage = null, isInvalid, ...rest }: Props) {
  /* exibindo as mensagens de erros na tela caso o input seja 
  inválido: se ele for inválido porque o usuário quis invalidar ele
  (isInvalid) ou se tem mensagem de error; */
  const invalid = !!errorMessage || isInvalid;
  
  return (
    <FormControl isInvalid={invalid} mb={4}>
      <NativeBaseInput 
        /* h: manipula a altura */
        h={14}
        /* px: padding na horizontal, espaçamento interno */
        px={4}
        fontSize="md"
        fontFamily="body"
        /* borderWidth: tira as bordas */
        borderWidth={0}
        color="white"
        bg="gray.700"
        placeholderTextColor="gray.300"
        /* estilizando inputs inválidos */
        isInvalid={invalid}
        _invalid={{
          borderWidth: 1,
          borderColor: "red.500"
        }}
        /* estilizando o focus do input */
        _focus={{
          bg: "gray.700",
          borderWidth: 1,
          borderColor: "green.500",
        }}
        {...rest}
      />

      <FormControl.ErrorMessage _text={{ color: "red.500" }}>
        {errorMessage}
      </FormControl.ErrorMessage>
    </FormControl>
  );
}
