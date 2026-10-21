import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tags-form',
  imports: [FormsModule],
  templateUrl: './tags-form.html',
  styleUrl: './tags-form.css',
})
export class TagsForm {
  eventVoltarPagina = output();
  eventOperacaoRealizada = output<Operacao>()
  receberExibicao = input<Exibicao>("CRIAR"); // Visualização padrão, para caso de bugs
  receberDadosEdicao = input<Tag>({
    id: "",
    name: "",
    description: "",
    type: "frontend"
  });
  //Criei um outro objeto apenas para evitar erros de referência
  bindingDadosTag: Tag = {
    id: "",
    name: "",
    description: "",
    type: "frontend"
  };

  ngOnInit() {
    if (this.receberExibicao() == "EDITAR") {
      this.bindingDadosTag = { ...this.receberDadosEdicao() }
    }
  }

  enviarEventOperacaoRealizada(tipoOperacao: "EDITAR" | "CRIAR") {
    this.eventOperacaoRealizada.emit({
      tipoOperacao,
      infoTag: { ...this.bindingDadosTag }
    })
  }

  enviarEventVoltarPagina() {
    this.eventVoltarPagina.emit();
  }
}