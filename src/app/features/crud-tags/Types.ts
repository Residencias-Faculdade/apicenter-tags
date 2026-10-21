type TipoTag = 'frontend' | 'backend' | 'database'

type Tag = {
  id: string,
  name: string,
  description: string,
  type: TipoTag
}

type Exibicao = 'EDITAR' | 'CRIAR'

type Operacao = {
  tipoOperacao: Exibicao,
  infoTag: Tag
}