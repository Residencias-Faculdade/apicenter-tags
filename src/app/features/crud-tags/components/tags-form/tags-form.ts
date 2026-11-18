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
  voltarSolicitado = output();
  operacaoRealizada = output<Operacao>();
  exibicao = input<Exibicao>('CRIAR');
  tagParaEdicao = input<Tag>({
    id: '',
    name: '',
    description: '',
    type: 'frontend',
  });

  tagFormulario: Tag = {
    id: '',
    name: '',
    description: '',
    type: 'frontend',
  };

  ngOnInit(): void {
    if (this.exibicao() === 'EDITAR') {
      this.tagFormulario = { ...this.tagParaEdicao() };
    }
  }

  onSubmeter(tipoOperacao: Exibicao): void {
    this.operacaoRealizada.emit({
      tipoOperacao,
      infoTag: { ...this.tagFormulario },
    });
  }

  onVoltar(): void {
    this.voltarSolicitado.emit();
  }
}
