import { Component, OnInit, signal } from '@angular/core';
import { Operacao, Tag } from '../features/crud-tags/Types';
import { TagsForm } from '../features/crud-tags/components/tags-form/tags-form';
import { TagsList } from '../features/crud-tags/components/tags-list/tags-list';
import { TagsService } from '../features/crud-tags/services/tags-service';

@Component({
  selector: 'app-web-component',
  imports: [TagsForm, TagsList],
  templateUrl: './web-component.html',
  styleUrl: './web-component.css',
})
export class WebComponent implements OnInit {
  pagina = signal<'LIST' | 'FORM'>('LIST');
  carregando = signal(false);
  erro = signal<string | null>(null);

  repassarDadosEdicao: Tag = {
    id: '',
    name: '',
    description: '',
    type: 'frontend',
  };
  repassarModeloExibicao: 'CRIAR' | 'EDITAR' = 'CRIAR';
  repassarDadosTags = signal<Tag[]>([]);

  constructor(private tagsService: TagsService) {}

  ngOnInit(): void {
    this.consumirDadosTags();
  }

  criarNovaTag(novaTag: Tag): void {
    this.erro.set(null);
    this.tagsService.criarNovaTag(novaTag).subscribe({
      next: (tag) => this.repassarDadosTags.update((tags) => [...tags, tag]),
      error: (erro: unknown) => this.registrarErro('Não foi possível criar a tag.', erro),
    });
  }

  editarTag(tagEditada: Tag): void {
    this.erro.set(null);
    this.tagsService.editarTag(tagEditada).subscribe({
      next: () =>
        this.repassarDadosTags.update((tags) =>
          tags.map((tag) => (tag.id === tagEditada.id ? { ...tagEditada } : tag)),
        ),
      error: (erro: unknown) => this.registrarErro('Não foi possível editar a tag.', erro),
    });
  }

  escutarEventoTelaEdicao(idTag: string): void {
    this.repassarModeloExibicao = 'EDITAR';
    const tag = this.repassarDadosTags().find((tagAtual) => tagAtual.id === idTag);
    if (tag) {
      this.repassarDadosEdicao = { ...tag };
      this.pagina.set('FORM');
    }
  }

  escutarEventoTelaCriacao(): void {
    this.repassarModeloExibicao = 'CRIAR';
    this.pagina.set('FORM');
  }

  escutarEventoVoltarPagina(): void {
    this.pagina.set('LIST');
  }

  escutarEventoOperacao(operacao: Operacao): void {
    switch (operacao.tipoOperacao) {
      case 'CRIAR':
        this.criarNovaTag(operacao.infoTag);
        break;
      case 'EDITAR':
        this.editarTag(operacao.infoTag);
        break;
    }
    this.pagina.set('LIST');
  }

  escutarEventoExclusao(idTag: string): void {
    if (!window.confirm('Deseja excluir essa Tag?')) {
      return;
    }

    this.erro.set(null);
    this.tagsService.excluirTag(idTag).subscribe({
      next: () =>
        this.repassarDadosTags.update((tags) => tags.filter((tag) => tag.id !== idTag)),
      error: (erro: unknown) => this.registrarErro('Não foi possível excluir a tag.', erro),
    });
  }

  private consumirDadosTags(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.tagsService.buscarTodos().subscribe({
      next: (tags) => this.repassarDadosTags.set(tags),
      error: (erro: unknown) => this.registrarErro('Não foi possível carregar as tags.', erro),
      complete: () => this.carregando.set(false),
    });
  }

  private registrarErro(mensagem: string, erro: unknown): void {
    const detalhe = erro instanceof Error ? erro.message : 'Erro desconhecido.';
    this.erro.set(`${mensagem} ${detalhe}`);
  }
}
