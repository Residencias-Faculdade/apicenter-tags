import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Tag } from '../features/crud-tags/Types';
import { WebComponent } from './web-component';

describe('WebComponent', () => {
  let component: WebComponent;
  let fixture: ComponentFixture<WebComponent>;
  let httpMock: HttpTestingController;
  const url = 'http://localhost:1080/tags';
  const tags: Tag[] = [
    { id: '1', name: 'Angular', description: 'Framework', type: 'frontend' },
    { id: '2', name: 'Java', description: 'Linguagem', type: 'backend' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(WebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne(url).flush(tags);
    await fixture.whenStable();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar as tags vindas da API', () => {
    expect(component.repassarDadosTags()).toHaveLength(2);
    expect(component.carregando()).toBe(false);
  });

  it('deve abrir o formulário para criação e voltar para a lista', () => {
    component.escutarEventoTelaCriacao();
    expect(component.pagina()).toBe('FORM');

    component.escutarEventoVoltarPagina();
    expect(component.pagina()).toBe('LIST');
  });

  it('deve criar uma tag e atualizar a lista', () => {
    const nova: Tag = { id: '3', name: 'MySQL', description: 'Banco', type: 'database' };
    component.criarNovaTag(nova);

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    req.flush(nova);
    expect(component.repassarDadosTags()).toHaveLength(3);
  });

  it('deve excluir somente após confirmação', () => {
    const confirmar = vi.mocked(window.confirm);
    confirmar.mockReturnValue(false);
    component.escutarEventoExclusao('1');
    httpMock.expectNone(`${url}/1`);
    expect(component.repassarDadosTags()).toHaveLength(2);

    confirmar.mockReturnValue(true);
    component.escutarEventoExclusao('1');
    httpMock.expectOne(`${url}/1`).flush(tags[0]);
    expect(component.repassarDadosTags().map((tag) => tag.id)).toEqual(['2']);
  });

  it('deve exibir mensagem de erro quando a API falhar', () => {
    component.escutarEventoExclusao('1');
    httpMock.expectOne(`${url}/1`).flush('falha', { status: 500, statusText: 'Server Error' });
    expect(component.erro()).toContain('Não foi possível excluir');
  });
});
