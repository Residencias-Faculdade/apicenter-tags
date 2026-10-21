import { Component, OnInit, output, signal } from '@angular/core';
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
  pagina = signal<"LIST" | "FORM">("LIST");
  repassarDadosEdicao: Tag = {
    id: "",
    name: "",
    description: "",
    type: ""
  };
  repassarModeloExibicao: "CRIAR" | "EDITAR" = "CRIAR";
  repassarDadosTags = signal<Tag[]>([]);

  constructor(private tagsService: TagsService) { }

  ngOnInit() {
    //No inicio, irei consumir os dados da api e repassar para o component de Listagem
    //Deixei o component pai responsavel por isso, para evitar varias requisições na API
    this.consumirDadosTags();
  }


  criarNovaTag(novaTag: Tag) {
    this.tagsService.criarNovaTag(novaTag)
      ?.subscribe({
        next: (tag) => {
          this.repassarDadosTags.update(tags => [...tags, tag as Tag])
        },
        error: (erro) => console.log("Erro: ", erro)
      });
  }

  editarTag(tagEditada: Tag) {
    this.tagsService.editarTag(tagEditada)
      ?.subscribe({
        next: () => {
          this.repassarDadosTags.update(arrayTags =>
            arrayTags.map(
              tagAtual => tagAtual.id === tagEditada.id ? tagAtual = { ...tagEditada } : tagAtual
            ));
        },
        error: (erro) => console.log("Erro: ", erro)
      })
  }

  escutarEventoTelaEdicao(idTag: string) {
    this.repassarModeloExibicao = "EDITAR";
    var dadosTag: Tag = this.repassarDadosTags().find((tagAtual) => tagAtual.id === idTag) as Tag;
    this.repassarDadosEdicao = { ...dadosTag };
    this.alterarPagina();
  }

  escutarEventoTelaCriacao() {
    this.repassarModeloExibicao = "CRIAR";
    this.alterarPagina();
  }

  escutarEventoVoltarPagina() {
    this.alterarPagina();
  }

  escutarEventoOperacao(operacao: Operacao) {
    switch (operacao.tipoOperacao) {
      case 'CRIAR':
        this.criarNovaTag(operacao.infoTag);
        break;
      case 'EDITAR':
        this.editarTag(operacao.infoTag);
        break;
    }
    this.alterarPagina()
  }

  escutarEventoExclusao(idTag: string) {
    this.tagsService.excluirTag(idTag)
      .subscribe({
        next: () => this.repassarDadosTags.update((tags) =>
          tags.filter((tagAtual) => tagAtual.id !== idTag))
        ,
        error: (erro) => console.log("Erro: ", erro)
      })
  }

  alterarPagina() {
    if (this.pagina() == "LIST") {
      this.pagina.set("FORM");
    } else {
      this.pagina.set("LIST");
    }
  }

  private consumirDadosTags() {
    this.tagsService.buscarTodos()
      .subscribe({
        next: (tagsRecebidas) => {
          this.tagsService.definirQuantidadeTags(tagsRecebidas.length);
          this.repassarDadosTags.set(tagsRecebidas);
        },
        error: (erro) => console.log(erro)
      })
  }
}