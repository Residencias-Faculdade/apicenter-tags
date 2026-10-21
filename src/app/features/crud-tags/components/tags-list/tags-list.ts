import { Component, computed, input, output, signal } from '@angular/core';

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

    return tags.filter(tag => tag.type === filtro);
  });

  alterarFiltroTipo(novoTipo: TipoFiltro) {
    this.filtroTipo.set(novoTipo);
  }

  enviarEventTelaNovaTag() {
    this.eventTelaNovaTag.emit();
  }

  capturarEventos(event: MouseEvent, operacao: 'EDITAR' | 'SELECIONAR' | 'EXCLUIR', idTag: string) {
    event.stopPropagation();
    switch (operacao) {
      case 'EDITAR':
        this.eventEdicao.emit(idTag);
        break;
      case 'EXCLUIR':
        var resposta = window.confirm("Deseja excluir essa Tag?");
        if (resposta) {
          this.eventExclusao.emit(idTag);
        }
        break;
    }

  }
}