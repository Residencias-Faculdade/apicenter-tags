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
  tags = input<Tag[]>([]);
  criacaoSolicitada = output();
  edicaoSolicitada = output<string>();
  exclusaoSolicitada = output<string>();

  filtroTipo = signal<TipoFiltro>('todas');

  tagsFiltradas = computed(() => {
    const filtro = this.filtroTipo();
    const tags = this.tags();

    if (filtro === 'todas') {
      return tags;
    }

    return tags.filter((tag) => tag.type === filtro);
  });

  onFiltroAlterado(tipo: TipoFiltro): void {
    this.filtroTipo.set(tipo);
  }

  onAdicionar(): void {
    this.criacaoSolicitada.emit();
  }

  onEditar(idTag: string): void {
    this.edicaoSolicitada.emit(idTag);
  }

  onExcluir(idTag: string): void {
    this.exclusaoSolicitada.emit(idTag);
  }
}
