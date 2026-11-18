import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Exibicao, Operacao, Tag } from '../../Types';

@Component({
  selector: 'app-tags-form',
  imports: [FormsModule],
  templateUrl: './tags-form.html',
  styleUrl: './tags-form.css',
})
export class TagsForm {
  eventVoltarPagina = output();
  eventOperacaoRealizada = output<Operacao>();
  receberExibicao = input<Exibicao>('CRIAR');
  receberDadosEdicao = input<Tag>({
    id: '',
    name: '',
    description: '',
    type: 'frontend',
  });

  bindingDadosTag: Tag = {
    id: '',
    name: '',
    description: '',
    type: 'frontend',
  };

  ngOnInit(): void {
    if (this.receberExibicao() === 'EDITAR') {
      this.bindingDadosTag = { ...this.receberDadosEdicao() };
    }
  }

  enviarEventOperacaoRealizada(tipoOperacao: Exibicao): void {
    this.eventOperacaoRealizada.emit({
      tipoOperacao,
      infoTag: { ...this.bindingDadosTag },
    });
  }

  enviarEventVoltarPagina(): void {
    this.eventVoltarPagina.emit();
  }
}
