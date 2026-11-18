# Relatório de Análise Estrutural — `mfe-tags`

> Analisado em: 2026-11-17 · Correções aplicadas em: 2026-11-18
> Escopo: `C:\Users\richa\OneDrive\Documentos\sefaz\crud-tags\mfe-tags\src` + arquivos de configuração do projeto
> Método: análise estática de todos os arquivos-fonte, configurações, dependências, build e histórico Git.
>
> **Situação atual:** nenhum risco crítico permanece em aberto. O problema do `provideHttpClient()` e todas as demais lacunas encontradas já foram corrigidos em código. O único ponto deliberadamente não alterado é a URL hardcoded da API (R2), por decisão do usuário.

---

## 1. Visão geral

`mfe-tags` é um **Micro Frontend (MFE) de CRUD de tags** construído com **Angular 21.2**, exposto como um **Web Component** (`<mfe-crud-tags>`) por meio de `@angular/elements`. Não é uma aplicação SPA tradicional: `main.ts` não chama `bootstrapApplication`, mas `createApplication()` (com `provideHttpClient()`) e `customElements.define()`, permitindo que qualquer host (Angular, React, Vue, HTML puro) incorpore o MFE apenas com uma tag HTML.

O domínio é simples: uma `Tag` (`id`, `name`, `description`, `type` ∈ `frontend | backend | database`) com operações de listar, filtrar, criar, editar e excluir. A persistência durante o desenvolvimento é feita por um `json-server` em Docker na porta `1080`, com dados em `db.json`.

Não havia documentação arquitetural no repositório (README é o template padrão do Angular CLI) — daí a necessidade dos ADRs.

---

## 2. Estrutura de diretórios (estado atual)

```
mfe-tags/
├── angular.json                 # @angular/build:application; budgets 500kB/1MB e 8kB/12kB (CSS); Vitest
├── package.json                 # Angular 21.2, @angular/elements, rxjs, vitest (sem zone.js e sem @angular/router)
├── tsconfig.json                # strict, strictTemplates, target ES2022, module preserve
├── tsconfig.app.json            # inclui src/**/*.ts, exclui *.spec.ts
├── db.json                      # base do json-server (5 tags de exemplo)
├── docker-compose.yml           # clue/json-server → localhost:1080
├── public/
└── src/
    ├── index.html               # <mfe-crud-tags></mfe-crud-tags>
    ├── main.ts                  # createApplication({providers:[provideHttpClient()]}) + createCustomElement + define()
    ├── styles.css               # vazio (comentário padrão)
    └── app/
        ├── web-component/       # CAMADA DE COMPOSIÇÃO (container / smart component)
        │   ├── web-component.ts       # estado, orquestração, carregando/erro, chamadas ao service
        │   ├── web-component.html     # alternância LIST/FORM + avisos de carregamento/erro
        │   ├── web-component.css      # estilos do host e dos avisos
        │   └── web-component.spec.ts
        └── features/crud-tags/  # FEATURE (apresentação + dados)
            ├── Types.ts              # tipos exportados: TipoTag, Tag, Exibicao, Operacao
            ├── components/
            │   ├── tags-form/        # presentation component (template-driven form)
            │   │   ├── tags-form.ts / .html / .css / .spec.ts
            │   └── tags-list/        # presentation component (tabela + filtro)
            │       ├── tags-list.ts / .html / .css / .spec.ts
            └── services/
                ├── tags-service.ts       # HttpClient + validação + geração de UUID
                └── tags-service.spec.ts
```

---

## 3. Decisões arquiteturais consolidadas (candidatas a ADR)

| ID sugerido | Decisão | Evidência no código | Status |
|---|---|---|---|
| ADR-0001 | Expor o MFE como **Web Component** (`<mfe-crud-tags>`) via `@angular/elements`, em vez de Module Federation ou iframe | `src/main.ts`, `src/index.html`, `package.json` | Aceita (implícita) |
| ADR-0002 | **Standalone components + Signals** com change detection **zoneless** (sem `zone.js`) | `web-component.ts`, `tags-list.ts`, `tags-form.ts`, `package.json` | Aceita (implícita) |
| ADR-0003 | **Container/Presentational** por feature, com contrato `input()` / `output()` | `app/web-component/*`, `features/crud-tags/components/*` | Aceita (implícita) |
| ADR-0004 | Navegação por **estado local** (`LIST` ⇄ `FORM`) via `pagina.set(...)`, sem roteador | `web-component.ts`, `web-component.html`; `@angular/router` removido | Aceita (corrigida) |
| ADR-0005 | **API REST mock** com `json-server` em Docker (`localhost:1080`) como backend de desenvolvimento | `docker-compose.yml`, `db.json`, `tags-service.ts` | Aceita (implícita) |
| ADR-0006 | **Service singleton** com `HttpClient` e `provideHttpClient()` no bootstrap e nos testes | `tags-service.ts`, `main.ts`, `*.spec.ts` | Aceita (corrigida) |
| ADR-0007 | Geração de ID no cliente via **`crypto.randomUUID()`** | `tags-service.ts` | Aceita (corrigida) |
| ADR-0008 | **Formulários template-driven** (`ngModel`), validação no service e estados de carregamento/erro no container | `tags-form.html`, `tags-service.ts`, `web-component.html` | Aceita (corrigida) |
| ADR-0009 | **Tipos exportados** e importados explicitamente entre arquivos | `Types.ts` e imports nos componentes/service | Aceita (corrigida) |
| ADR-0010 | **Testes com Vitest + jsdom**, HTTP mockado com `HttpTestingController` | `angular.json`, `package.json`, `*.spec.ts` | Aceita (corrigida) |
| ADR-0011 | **CSS escopo por componente** com `:host`, sem design system | `*.css`, `styles.css` (vazio), `angular.json` | Aceita (corrigida) |
| ADR-0012 | **URL da API hardcoded** `http://localhost:1080/tags`, mantida por decisão explícita | `tags-service.ts` | Aceita (decisão do usuário) |

### Contrato público do Web Component

O elemento `<mfe-crud-tags>` **não expõe inputs/propriedades/eventos** na classe `WebComponent`: é autocontido, busca seus próprios dados e gerencia a navegação internamente. Isso dá acoplamento zero com o host, mas impede que ele injete configuração ou reaja a mudanças — vale registrar como ADR específico.

---

## 4. Detalhamento por camada (estado atual)

### Bootstrap / integração (`src/main.ts`)
- `createApplication({ providers: [provideHttpClient()] })` — provider necessário para o `HttpClient` do `TagsService`.
- `createCustomElement(WebComponent, { injector: app.injector })` → Custom Element.
- `customElements.define('mfe-crud-tags', ...)`; `index.html` usa a tag diretamente.

### Composição (`app/web-component`)
- `WebComponent` é o **smart component**: `pagina = signal<'LIST'|'FORM'>`, `carregando`, `erro`, `tags = signal<Tag[]>`, `tagEmEdicao`, `exibicao`. Handlers seguem o padrão `on...` (`onCriacaoSolicitada`, `onEdicaoSolicitada`, `onExclusaoSolicitada`, `onVoltarSolicitado`, `onOperacaoRealizada`); outputs dos filhos não usam prefixo `event` (`criacaoSolicitada`, `edicaoSolicitada`, `exclusaoSolicitada`, `voltarSolicitado`, `operacaoRealizada`).
- `ngOnInit` centraliza o `GET` para evitar requisições repetidas; atualiza estado com `update()` imutável.
- Navegação determinística com `pagina.set('LIST'|'FORM')`; `window.confirm()` da exclusão fica aqui, não na apresentação.
- Template exibe "Carregando tags..." e um bloco de erro com botão de fechar.

### Apresentação (`features/crud-tags/components`)
- `TagsList`: `input<Tag[]>()`, `output()` para edição/exclusão/nova tag, `signal<TipoFiltro>()` + `computed()` para filtro client-side, `@for`/`@if`/`@empty`. Apenas emite ids.
- `TagsForm`: `input<Exibicao>()`, `input<Tag>()`, `output<Operacao>()`; `(ngSubmit)` evita navegação por Enter; cópia do objeto recebido para não mutar referência.
- Ambos são **presentation components puros**: não injetam serviços.

### Dados (`features/crud-tags/services`)
- `TagsService`: `GET/POST/PUT/DELETE` em `http://localhost:1080/tags` (URL mantida).
- Validação de nome retorna `Observable` com erro via `throwError()` — sem `alert()`.
- ID gerado com `crypto.randomUUID()`.

### Qualidade / build
- TypeScript `strict` + `strictTemplates`; `@angular/build:application` (esbuild).
- Budgets: 500 kB/1 MB (initial), 8 kB/12 kB (CSS por componente).
- Vitest via `@angular/build:unit-test`; 23 testes de comportamento.
- Sem lint configurado; Prettier (`printWidth: 100`, `singleQuote: true`).

---

## 5. Situação dos riscos identificados

Nenhum risco crítico está em aberto. R1 foi corrigido; R2 permanece por opção explícita.

| ID | Situação | O que mudou (ou por que ficou) |
|---|---|---|
| R1 — provider de `HttpClient` | ✅ Corrigido | `provideHttpClient()` no `createApplication()` e nos `TestBed`; não há mais `NullInjectorError` |
| R2 — URL hardcoded | ⏸️ Mantido por decisão do usuário | URL continua `http://localhost:1080/tags`; consequência: rebuild necessário para trocar de ambiente |
| R3 — ID sequencial | ✅ Corrigido | `crypto.randomUUID()`; contador e `definirQuantidadeTags()` removidos |
| R4 — `alert()`/`console.log()` | ✅ Corrigido | Erro via `Observable` + signals `carregando`/`erro` no container |
| R5 — `window.confirm()` na apresentação | ✅ Corrigido | Confirmação movida para o container; caso `'SELECIONAR'` removido |
| R6 — `alterarPagina()` toggle | ✅ Corrigido | `pagina.set()` explícito |
| R7 — seletores globais em Shadow DOM | ✅ Corrigido | `*` e `body` trocados por `:host` |
| R8 — budget de CSS | ✅ Corrigido | Ajustado para 8 kB/12 kB; build sem avisos |
| R9 — testes superficiais | ✅ Corrigido | 23 testes com `HttpTestingController` |
| R10 — tipos globais sem `export` | ✅ Corrigido | `export` + imports explícitos |
| R11 — `@angular/router` não usado | ✅ Corrigido | Dependência removida via `npm uninstall` |

### Validação executada (2026-11-17 / 18)

- `npm test -- --watch=false` → 4 arquivos, **23 testes, 0 falhas**
- `npm run build` → sucesso, sem avisos de budget, bundle inicial 208,40 kB (56,08 kB transferência)
- `npm audit --omit=dev --audit-level=high` → 0 vulnerabilidades em dependências de produção (avisos restantes são apenas da cadeia de ferramentas de dev)
- HTTP foi validado **mockado** (`HttpTestingController`). A integração **live** com o `json-server` em Docker não foi executada nesta rodada.

---

## 6. Conjunto de ADRs recomendado

1. **ADR-0001** — Exposição do MFE como Web Component (`@angular/elements`)
2. **ADR-0002** — Standalone components, Signals e change detection zoneless
3. **ADR-0003** — Divisão Container/Presentational e contrato `input()/output()`
4. **ADR-0004** — Navegação por estado local em vez de Router
5. **ADR-0005** — API de desenvolvimento com json-server em Docker
6. **ADR-0006** — Service com `HttpClient` e `provideHttpClient()` (R1 corrigido)
7. **ADR-0007** — Estratégia de identificadores com UUID (R3 corrigido)
8. **ADR-0008** — URL hardcoded da API — decisão mantida a pedido do usuário (R2)
9. **ADR-0009** — Formulários template-driven, validação e estados de carregamento/erro (R4/R5)
10. **ADR-0010** — Estratégia de testes unitários com HTTP mockado (R9)
11. **ADR-0011** — Contrato público do Custom Element (configuração e eventos para o host)
12. **ADR-0012** — Escopo de CSS com `:host` e budget de estilo (R7/R8)

---

## 7. Prompt pronto para uma LLM gerar os ADRs

> Copie o bloco abaixo em uma LLM (com acesso ao repositório ou com o contexto já colado).

```text
Você é um Arquiteto de Software Sênior com experiência em Angular 21, Micro Frontends, Web Components e documentação de decisões arquiteturais (ADR).

OBJETIVO
Gere um conjunto de ADRs (Architecture Decision Records / Registros de Decisão Arquiteturais) para o projeto `mfe-tags`, a partir do contexto abaixo. As decisões já estão implementadas em código, mas nunca foram documentadas; seu trabalho é torná-las explícitas, apontar alternativas e registrar as decisões de correção já aplicadas.

CONTEXTO DO PROJETO (estado atual do código)

Estrutura:
mfe-tags/
├── angular.json        (@angular/build:application; budgets 500kB/1MB initial e 8kB/12kB por CSS; builder de teste @angular/build:unit-test)
├── package.json        (Angular 21.2; @angular/elements 21.2; rxjs 7.8; vitest 4; jsdom 28; prettier; SEM zone.js e SEM @angular/router)
├── tsconfig.json       (strict, strictTemplates, noImplicitReturns, target ES2022, module preserve)
├── db.json             (5 tags de exemplo, ids "001" a "005")
├── docker-compose.yml  (clue/json-server, volume ./db.json, porta 1080:80)
└── src/
    ├── index.html      (<mfe-crud-tags></mfe-crud-tags>)
    ├── main.ts         (createApplication({ providers: [provideHttpClient()] }); createCustomElement(WebComponent, { injector: app.injector }); customElements.define('mfe-crud-tags', ...))
    ├── styles.css      (vazio)
    └── app/
        ├── web-component/ (web-component.ts/.html/.css/.spec.ts)
        └── features/crud-tags/
            ├── Types.ts — export de TipoTag, Tag, Exibicao e Operacao; importados explicitamente pelos demais arquivos
            ├── components/tags-form/ (ts/html/css/spec) — FormsModule + ngModel, input<Exibicao>(), input<Tag>(), output<Operacao>(), output(), (ngSubmit)
            ├── components/tags-list/ (ts/html/css/spec) — input<Tag[]>(), output<string>() para edição/exclusão, signal<TipoFiltro>() + computed() de filtro, @for/@if/@empty
            └── services/tags-service.ts — @Injectable({providedIn:'root'}), HttpClient, URL fixa http://localhost:1080/tags (mantida por decisão explícita), GET/POST/PUT/DELETE, validação de nome retorna Observable de erro via throwError(), ID gerado no cliente com crypto.randomUUID()

Comportamento observado:
- WebComponent é o container/smart component: mantém pagina = signal<'LIST'|'FORM'>('LIST'), carregando = signal(false), erro = signal<string|null>(null), tags = signal<Tag[]>([]), tagEmEdicao, exibicao; centraliza o GET no ngOnInit ("para evitar várias requisições"); atualiza estado com update() imutável; troca de página com pagina.set('LIST'|'FORM') explícito; window.confirm() da exclusão vive no container; exibe estados de carregamento e erro no template.
- Convenção de nomes adotada no template: métodos handler com prefixo on (onCriacaoSolicitada, onEdicaoSolicitada, onExclusaoSolicitada, onVoltarSolicitado, onOperacaoRealizada) e outputs SEM prefixo event e SEM prefixo on (criacaoSolicitada, edicaoSolicitada, exclusaoSolicitada, voltarSolicitado, operacaoRealizada). Métodos internos usam verbo direto (carregarTags, registrarErro) e o estado não usa prefixo repassar (tags, tagEmEdicao, exibicao). O service expõe listarTags(), criarTag(), editarTag(), excluirTag().
- TagsForm e TagsList são presentation components puros: não injetam serviços, recebem input() e emitem output(). TagsForm copia o objeto recebido ({...tagParaEdicao()}) para evitar mutação por referência. TagsList apenas emite ids para edição/exclusão, sem diálogos nativos.
- Navegação LIST/FORM é feita por @if no template do container, sem roteador (a dependência @angular/router foi removida).
- O elemento <mfe-crud-tags> NÃO expõe inputs/propriedades/eventos públicos: é autocontido, busca seus próprios dados e não notifica o host.
- Estilos são CSS por componente (ViewEncapsulation padrão), styles.css global vazio; os seletores * e body foram trocados por :host dentro dos componentes.
- Testes: 23 testes em 4 arquivos, com provideHttpClient()/provideHttpClientTesting(), HttpTestingController e spy de window.confirm; cobrem CRUD, filtro, validação, loading/erro e emissões de output. `npm test -- --watch=false` e `npm run build` passam sem erros.

Histórico de decisões de correção (já aplicadas em código — documente como decisões tomadas, NÃO como problemas em aberto):
R1 createApplication() não fornecia providers e não havia provideHttpClient() → corrigido no bootstrap e nos testes.
R2 URL da API hardcoded em http://localhost:1080/tags → MANTIDA por decisão explícita do usuário; registrar consequências e plano de migração futuro.
R3 ID sequencial local (não idempotente, race condition, formato "6" vs "001" do seed) → substituído por crypto.randomUUID().
R4 alert()/console.log() para erro, sem loading/error state → substituído por erro via Observable + signals carregando/erro no container.
R5 window.confirm() no presentation component e case 'SELECIONAR' sem implementação → confirmação movida para o container e caso morto removido.
R6 alterarPagina() era toggle → substituído por pagina.set() explícito.
R7 seletores globais em CSS dentro de Web Component → trocados por :host.
R8 CSS acima do budget de 4 kB → budget ajustado para 8 kB (warning) / 12 kB (erro).
R9 cobertura de testes insuficiente → 23 testes de comportamento.
R10 tipos globais sem export → export + imports explícitos.
R11 dependência @angular/router não utilizada → removida via npm uninstall.

REGRAS
1. Idioma: português (pt-BR). Tom técnico, direto e objetivo.
2. Cada ADR DEVE conter exatamente estas seções, nesta ordem:
   ## Título
   ## Status
   ## Data
   ## Contexto
   ## Decisão
   ## Alternativas Consideradas (mínimo 2 por ADR, cada uma com o motivo da rejeição)
   ## Consequências (subseções Positivas e Negativas)
   ## Riscos e Mitigações
   ## Evidências (caminhos de arquivo e, quando possível, linhas)
3. Use Status = "Aceita (implícita)" para decisões já implementadas sem registro, "Aceita (corrigida)" para decisões que nasceram de uma correção de dívida e "Aceita (decisão do usuário)" para a URL hardcoded. Use a data 2026-11-18.
4. Separe o resultado em duas partes: "Parte 1 — Decisões consolidadas" e "Parte 2 — Decisões de correção e dívida tratada". Em nenhuma das partes descreva o código antigo como se fosse o estado atual.
5. Cubra no mínimo estes 12 ADRs: (1) Web Component como estratégia de MFE; (2) Standalone + Signals + zoneless; (3) Container/Presentational com input()/output(); (4) Navegação por estado local em vez de Router; (5) json-server/Docker como API de dev; (6) Service com HttpClient e provideHttpClient() no bootstrap (R1); (7) Estratégia de ID com UUID (R3); (8) URL hardcoded da API — decisão mantida a pedido do usuário, com consequências e plano de migração futuro (R2); (9) Formulários template-driven, validação e estados de carregamento/erro (R4/R5); (10) Estratégia de testes com HttpTestingController (R9); (11) Contrato público do Custom Element — ausência de inputs/eventos para o host; (12) Escopo de CSS com :host e budget de estilo (R7/R8).
6. Não invente fatos que não estejam no contexto. Quando uma afirmação for dedução, marque-a explicitamente como [ASSUNÇÃO].
7. Numere os ADRs como ADR-0001, ADR-0002, ... e gere também um `docs/adr/README.md` com índice (número, título, status, link).
8. Ao final, inclua um "Resumo Executivo" com no máximo 5 bullets destacando as decisões mais estruturantes e registrando que o único ponto deliberadamente não corrigido é a URL hardcoded (R2). Não afirme que existe risco crítico aberto relativo a provideHttpClient — ele foi corrigido.
9. Entregue o conteúdo como arquivos Markdown prontos para commit, com os caminhos `docs/adr/ADR-0001-...md` etc., além do índice. Não inclua explicações fora dos arquivos.

FORMATO DE SAÍDA
Apenas os arquivos Markdown numerados e o README de índice, completos e prontos para uso.
```

---

## 8. Como usar este relatório

1. Abra uma LLM com acesso ao repositório (ou cole o prompt acima, que já traz o estado atual do código).
2. Peça para salvar os arquivos em `docs/adr/` (o prompt já solicita isso).
3. Revise especialmente o ADR da URL hardcoded (decisão mantida) e os ADRs de correção (provider HTTP, UUID, estados de erro).
4. Este documento descreve o estado **após** as correções. O histórico do que foi mudado está resumido na seção 5.
