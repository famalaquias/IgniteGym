import { Image, IImageProps } from 'native-base';

/* criando as tipagens da imagem */
type Props = IImageProps & {
  /* definindo altura e largura */
  size: number;
}

export function UserPhoto({ size, ...rest }: Props) {
  return (
    <Image 
      w={size}
      h={size}
      /* rounded: imagem completamente redonda */
      rounded="full"
      borderWidth={2}
      borderColor="gray.400"

      {...rest}    
    />
  );
}
