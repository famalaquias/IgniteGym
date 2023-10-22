import { Button as NativeBaseButton, IIconButtonProps, Text } from 'native-base';

type Props = IIconButtonProps & {
  title: string;
  /* solid: botão normal - de Acessar;
  outline: botão diferente - de Criar conta */
  variant?: 'solid' | 'outline';
}

export function Button({ title, variant = 'solid', ...rest }: Props) {
  return (
    <NativeBaseButton 
      /* w: largura do botão; full: ocupa toda tela */
      w="full"
      h={14}
      /* rounded: arredonda as bordas do botão */
      rounded="sm"
      borderWidth={variant === "outline" ? 1 : 0}
      borderColor="green.500"
      bg={variant === "outline" ? "transparent" : "green.700"}
      /* se o usuário clicar ou clicar e segurar o botão mude a cor*/
      _pressed={{
        bg: variant === "outline" ? "gray.500" : "green.500"
      }}
      {...rest}
    >
      <Text
        fontSize="md"
        fontFamily="heading"
        color={variant === "outline" ? "green.500" : "white"}
      >
        {title}
      </Text>
    </NativeBaseButton>
  );
}
