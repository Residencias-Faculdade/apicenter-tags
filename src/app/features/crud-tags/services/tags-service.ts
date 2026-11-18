import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Tag } from '../Types';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private readonly url = 'http://localhost:1080/tags';
  private readonly MINIMO_CARACTERES = 1;

  constructor(private httpClient: HttpClient) {}

  listarTags(): Observable<Tag[]> {
    return this.httpClient.get<Tag[]>(this.url);
  }

  criarTag(novaTag: Tag): Observable<Tag> {
    const erroValidacao = this.validarNome(novaTag.name);
    if (erroValidacao) {
      return throwError(() => new Error(erroValidacao));
    }

    return this.httpClient.post<Tag>(this.url, { ...novaTag, id: crypto.randomUUID() });
  }

  editarTag(tagEditada: Tag): Observable<Tag> {
    const erroValidacao = this.validarNome(tagEditada.name);
    if (erroValidacao) {
      return throwError(() => new Error(erroValidacao));
    }

    return this.httpClient.put<Tag>(`${this.url}/${tagEditada.id}`, tagEditada);
  }

  excluirTag(idTag: string): Observable<Tag> {
    return this.httpClient.delete<Tag>(`${this.url}/${idTag}`);
  }

  private validarNome(nomeTag: string): string | null {
    if (nomeTag.trim().length <= this.MINIMO_CARACTERES) {
      return 'Nome inválido: informe ao menos 2 caracteres.';
    }
    return null;
  }
}
