type Tag = {
  id: string,
  name: string,
  description: string,
  type: string
}

type Exibicao = 'EDITAR' | 'CRIAR'

type Operacao = {
  tipoOperacao: Exibicao,
  infoTag: Tag
}