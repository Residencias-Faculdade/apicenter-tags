import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Tag } from '../Types';
import { TagsService } from './tags-service';

describe('TagsService', () => {
  let service: TagsService;
  let httpMock: HttpTestingController;
  const url = 'http://localhost:1080/tags';
  const tag: Tag = { id: '1', name: 'Angular', description: 'Framework', type: 'frontend' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TagsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve listar todas as tags', () => {
    service.listarTags().subscribe((tags) => expect(tags).toEqual([tag]));

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([tag]);
  });

  it('deve criar tag com id UUID via POST', () => {
    const nova: Tag = { id: '', name: 'Java', description: 'Linguagem', type: 'backend' };
    let criada: Tag | undefined;
    service.criarTag(nova).subscribe((resposta) => (criada = resposta));

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-/);
    req.flush({ ...nova, id: req.request.body.id });
    expect(criada?.name).toBe('Java');
  });

  it('deve rejeitar nome inválido sem chamar a API', () => {
    let mensagem = '';
    service.criarTag({ ...tag, name: 'A' }).subscribe({
      error: (erro: Error) => (mensagem = erro.message),
    });

    expect(mensagem).toContain('Nome inválido');
    httpMock.expectNone(url);
  });

  it('deve editar tag via PUT', () => {
    service.editarTag(tag).subscribe();

    const req = httpMock.expectOne(`${url}/${tag.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(tag);
    req.flush(tag);
  });

  it('deve excluir tag via DELETE', () => {
    service.excluirTag(tag.id).subscribe();

    const req = httpMock.expectOne(`${url}/${tag.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(tag);
  });
});
