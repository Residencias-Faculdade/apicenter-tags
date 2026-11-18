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

  tagEmEdicao: Tag = {
    id: '',
    name: '',
    description: '',
    type: 'frontend',
  };
  exibicao: 'CRIAR' | 'EDITAR' = 'CRIAR';
  tags = signal<Tag[]>([]);

  constructor(private tagsService: TagsService) {}

  ngOnInit(): void {
    this.carregarTags();
  }

  criarTag(tag: Tag): void {
    this.erro.set(null);
    this.tagsService.criarTag(tag).subscribe({
      next: (criada) => this.tags.update((tags) => [...tags, criada]),
      error: (erro: unknown) => this.registrarErro('Não foi possível criar a tag.', erro),
    });
  }

  editarTag(tag: Tag): void {
    this.erro.set(null);
    this.tagsService.editarTag(tag).subscribe({
      next: () =>
        this.tags.update((tags) => tags.map((atual) => (atual.id === tag.id ? { ...tag } : atual))),
      error: (erro: unknown) => this.registrarErro('Não foi possível editar a tag.', erro),
    });
  }

  onCriacaoSolicitada(): void {
    this.exibicao = 'CRIAR';
    this.pagina.set('FORM');
  }

  onEdicaoSolicitada(idTag: string): void {
    const tag = this.tags().find((atual) => atual.id === idTag);
    if (!tag) {
      return;
    }

    this.exibicao = 'EDITAR';
    this.tagEmEdicao = { ...tag };
    this.pagina.set('FORM');
  }

  onVoltarSolicitado(): void {
    this.pagina.set('LIST');
  }

  onOperacaoRealizada(operacao: Operacao): void {
    if (operacao.tipoOperacao === 'CRIAR') {
      this.criarTag(operacao.infoTag);
    } else {
      this.editarTag(operacao.infoTag);
    }
    this.pagina.set('LIST');
  }

  onExclusaoSolicitada(idTag: string): void {
    if (!window.confirm('Deseja excluir essa Tag?')) {
      return;
    }

    this.erro.set(null);
    this.tagsService.excluirTag(idTag).subscribe({
      next: () => this.tags.update((tags) => tags.filter((tag) => tag.id !== idTag)),
      error: (erro: unknown) => this.registrarErro('Não foi possível excluir a tag.', erro),
    });
  }

  private carregarTags(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.tagsService.listarTags().subscribe({
      next: (tags) => this.tags.set(tags),
      error: (erro: unknown) => this.registrarErro('Não foi possível carregar as tags.', erro),
      complete: () => this.carregando.set(false),
    });
  }

  private registrarErro(mensagem: string, erro: unknown): void {
    const detalhe = erro instanceof Error ? erro.message : 'Erro desconhecido.';
    this.erro.set(`${mensagem} ${detalhe}`);
  }
}
