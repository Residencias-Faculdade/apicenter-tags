import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private url = "http://localhost:1080/tags";
  private readonly MINIMO_CARACTERES = 1;
  private quantidadeTags: number = 0;

  constructor(private httpClient: HttpClient) { }

  buscarTodos() {
    var tags = this.httpClient.get<Tag[]>(this.url)
    return tags;
  }

  criarNovaTag(novaTag: Tag) {
    var nomeTag: string = novaTag.name;

    if (!this.validarNome(nomeTag)) {
      alert("Nome inválido, poucos caracteres.");
      return null;
    }

    novaTag.id = this.gerarNovoId();
    return this.httpClient.post(this.url, novaTag);
  }

  editarTag(tagEditada: Tag) {
    var nomeTag: string = tagEditada.name;

    if (!this.validarNome(nomeTag)) {
      alert("Nome inválido, poucos caracteres.");
      return null;
    }

    return this.httpClient.put<Tag>(this.url + `/${tagEditada.id}`, tagEditada)
  }

  excluirTag(idTag: string) {
    return this.httpClient.delete<Tag>(this.url + `/${idTag}`)
  }

  private validarNome(nomeTag: string): boolean {
    var analiseNome = nomeTag.trim();
    return analiseNome.length > this.MINIMO_CARACTERES;
  }

  private gerarNovoId(): string {
    this.quantidadeTags += 1;
    return this.quantidadeTags.toString();
  }

  public definirQuantidadeTags(quantidadeTags: number) {
    this.quantidadeTags = quantidadeTags;
  }
}