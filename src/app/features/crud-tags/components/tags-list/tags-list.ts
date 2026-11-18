import { Component, computed, input, output, signal } from '@angular/core';
import { Tag, TipoTag } from '../../Types';

type TipoFiltro = 'todas' | TipoTag;

@Component({
  selector: 'app-tags-list',
  imports: [],
  templateUrl: './tags-list.html',
  styleUrl: './tags-list.css',
})
export class TagsList {
  tagsRecebidas = input<Tag[]>([]);
  eventTelaNovaTag = output();
  eventEdicao = output<string>();
  eventExclusao = output<string>();

  filtroTipo = signal<TipoFiltro>('todas');

  tagsFiltradas = computed(() => {
    const filtro = this.filtroTipo();
    const tags = this.tagsRecebidas();

    if (filtro === 'todas') {
      return tags;
    }

    return tags.filter((tag) => tag.type === filtro);
  });

  alterarFiltroTipo(novoTipo: TipoFiltro): void {
    this.filtroTipo.set(novoTipo);
  }

  solicitarNovaTag(): void {
    this.eventTelaNovaTag.emit();
  }

  solicitarEdicao(idTag: string): void {
    this.eventEdicao.emit(idTag);
  }

  solicitarExclusao(idTag: string): void {
    this.eventExclusao.emit(idTag);
  }
}
