import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Operacao, Tag } from '../../Types';
import { TagsForm } from './tags-form';

describe('TagsForm', () => {
  let component: TagsForm;
  let fixture: ComponentFixture<TagsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsForm],
    }).compileComponents();

    fixture = TestBed.createComponent(TagsForm);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deve emitir operação de criação com os dados do formulário', () => {
    fixture.detectChanges();
    let operacao: Operacao | undefined;
    component.operacaoRealizada.subscribe((valor) => (operacao = valor));

    component.tagFormulario = {
      id: '',
      name: 'Nova tag',
      description: 'Descrição',
      type: 'database',
    };
    component.onSubmeter('CRIAR');

    expect(operacao?.tipoOperacao).toBe('CRIAR');
    expect(operacao?.infoTag.name).toBe('Nova tag');
  });

  it('deve copiar os dados recebidos no modo edição sem manter a referência', () => {
    const original: Tag = {
      id: '1',
      name: 'Angular',
      description: 'Framework',
      type: 'frontend',
    };
    fixture.componentRef.setInput('tagParaEdicao', original);
    fixture.componentRef.setInput('exibicao', 'EDITAR');
    fixture.detectChanges();

    expect(component.tagFormulario).toEqual(original);
    expect(component.tagFormulario).not.toBe(original);
  });

  it('deve emitir evento para voltar à listagem', () => {
    fixture.detectChanges();
    let voltou = false;
    component.voltarSolicitado.subscribe(() => (voltou = true));

    component.onVoltar();
    expect(voltou).toBe(true);
  });
});
