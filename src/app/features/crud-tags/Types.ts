export type TipoTag = 'frontend' | 'backend' | 'database';

export type Tag = {
  id: string;
  name: string;
  description: string;
  type: TipoTag;
};

export type Exibicao = 'EDITAR' | 'CRIAR';

export type Operacao = {
  tipoOperacao: Exibicao;
  infoTag: Tag;
};
