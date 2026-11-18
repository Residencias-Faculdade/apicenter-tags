import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tag } from '../../Types';
import { TagsList } from './tags-list';

describe('TagsList', () => {
  let component: TagsList;
  let fixture: ComponentFixture<TagsList>;
  const tags: Tag[] = [
    { id: '1', name: 'Angular', description: 'Framework', type: 'frontend' },
    { id: '2', name: 'Java', description: 'Linguagem', type: 'backend' },
    { id: '3', name: 'MySQL', description: 'Banco', type: 'database' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsList],
    }).compileComponents();

    fixture = TestBed.createComponent(TagsList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tagsRecebidas', tags);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir todas as tags por padrão', () => {
    expect(component.tagsFiltradas()).toHaveLength(3);
  });

  it('deve filtrar as tags pelo tipo', () => {
    component.alterarFiltroTipo('backend');
    expect(component.tagsFiltradas().map((tag) => tag.name)).toEqual(['Java']);
  });

  it('deve emitir o id da tag ao solicitar edição', () => {
    let id = '';
    component.eventEdicao.subscribe((valor) => (id = valor));

    component.solicitarEdicao('2');
    expect(id).toBe('2');
  });

  it('deve emitir o id da tag ao solicitar exclusão sem exibir confirmação', () => {
    let id = '';
    component.eventExclusao.subscribe((valor) => (id = valor));

    component.solicitarExclusao('2');
    expect(id).toBe('2');
  });
});
