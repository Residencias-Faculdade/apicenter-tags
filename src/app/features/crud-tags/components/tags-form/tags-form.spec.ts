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
    component.eventOperacaoRealizada.subscribe((valor) => (operacao = valor));

    component.bindingDadosTag = {
      id: '',
      name: 'Nova tag',
      description: 'Descrição',
      type: 'database',
    };
    component.enviarEventOperacaoRealizada('CRIAR');

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
    fixture.componentRef.setInput('receberDadosEdicao', original);
    fixture.componentRef.setInput('receberExibicao', 'EDITAR');
    fixture.detectChanges();

    expect(component.bindingDadosTag).toEqual(original);
    expect(component.bindingDadosTag).not.toBe(original);
  });

  it('deve emitir evento para voltar à listagem', () => {
    fixture.detectChanges();
    let voltou = false;
    component.eventVoltarPagina.subscribe(() => (voltou = true));

    component.enviarEventVoltarPagina();
    expect(voltou).toBe(true);
  });
});
