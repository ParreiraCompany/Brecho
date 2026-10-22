# Configuração real da Fase 1 — Brechó Parreira

O site funciona como **frontend estático com dados reais em Supabase**. Portanto, pode ficar no GitHub Pages, enquanto as roupas, fotos e acessos ficam no Supabase. **Sem configurar o Supabase, a vitrine é exibida vazia e o login está inativo; não são exibidos produtos fictícios.**

## 1. Criar o banco de dados

1. Entre em https://supabase.com e crie um projeto novo. Escolha uma senha forte para o banco e guarde-a em um gerenciador de senhas.
2. Abra **SQL Editor**, clique em **New query** e copie todo o arquivo `supabase/migrations/001_fase_1.sql`. Execute a consulta. Ela cria tabelas, categorias, funções, regras RLS e o bucket privado `product-photos`.
3. Em **Authentication > Providers > Email**, mantenha o login por e-mail habilitado. **Desative cadastro público de novas contas**, se a configuração do projeto permitir. **Não** habilite cadastro de visitantes no aplicativo.
4. Em **Authentication > URL Configuration**, ajuste a URL do site publicado, especialmente se optar por recuperação de senha.

## 2. Criar exatamente duas contas OWNER

1. No painel Supabase, acesse **Authentication > Users > Add user**. Crie manualmente a conta do primeiro responsável com seu e-mail e senha individual forte.
2. Repita para a segunda responsável, com outro e-mail e outra senha individual forte.
3. Copie o **UUID** (`User ID`) de cada conta. Os identificadores aparecem na seção Users.
4. No SQL Editor, execute o bloco abaixo **substituindo os UUIDs de exemplo** (não copie as chaves literais com colchetes):

```sql
insert into public.owner_profiles (auth_user_id, display_name, role, active)
values
  ('COLE-AQUI-O-UUID-DO-OWNER-01', 'Proprietário', 'OWNER', true),
  ('COLE-AQUI-O-UUID-DO-OWNER-02', 'Mãe', 'OWNER', true);
```

**Importante:** Não coloque UUIDs de exemplo, credenciais, senhas ou chaves `service_role` no código público, no ZIP ou no GitHub. A criação de owners é feita exclusivamente pelo SQL Editor do seu projeto.

As tabelas bloqueiam alteração por visitantes, mesmo que tentem modificar requisições manualmente. Não existe rota para registrar administradores. A validação usa uma função segura do banco `public.is_owner()`, não botões ocultos no navegador.

## 3. Conectar a vitrine ao Supabase

1. Abra **Project Settings > API** ou **Connect**, conforme a interface atual do Supabase.
2. Copie a **Project URL** (`https://...supabase.co`) e a **publishable key** ou chave legada **anon**. A chave publishable/anon foi projetada para uso em clientes públicos quando acompanhada de RLS.
3. Abra `src/config.js` e preencha somente as duas linhas correspondentes:

```js
export const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'SUA_CHAVE_PUBLICAVEL_OU_ANON';
```

**Nunca** use a chave `service_role`/secret no site. Ela ignora políticas de segurança e permitiria comprometimento do banco.

## 4. Configurar seu único WhatsApp comercial

1. Abra o site publicado.
2. Entre na **Área dos proprietários** usando uma das duas contas criadas.
3. Acesse **Configurações da vitrine**.
4. Digite o WhatsApp no formato `55 + DDD + número`, por exemplo, `5562...` (não use número fictício). Salve.
5. Agora a sacola exibirá uma solicitação que abre o WhatsApp com a mensagem preenchida. O cliente precisa decidir se irá enviá-la; isso **não reserva a peça automaticamente**.

## 5. Publicar no GitHub Pages

**Não é necessário npm, Node, Vercel ou compilação** para publicar esta versão.

1. Crie um repositório no GitHub (por exemplo, `Brecho-Parreira`).
2. Abra o repositório e clique em **Add file > Upload files**.
3. Extraia o ZIP no seu computador e envie **todo o conteúdo interno da pasta** `brecho-parreira` para a raiz do repositório — `index.html`, `assets`, `src`, `supabase`, `docs` etc. Não envie apenas `index.html` nem faça upload do ZIP sem extrair.
4. Vá em **Settings > Pages** e escolha **Deploy from a branch**, branch `main`, pasta `/(root)`.
5. Aguarde o GitHub Pages indicar a URL publicada. O catálogo usa endereços com `#/` (`.../#/catalogo`, `.../#/owner/login`) porque são compatíveis com GitHub Pages e funcionam após apertar F5.
6. Abra o endereço do site, faça login e teste uma publicação real.

**Depois de conectado:** cadastrar, alterar fotos e atualizar preços ocorre no painel, sem alterar arquivos nem usar GitHub de novo. Apenas mudanças no design/código exigem novo commit.

## 6. Teste mínimo antes de divulgar

- [ ] Dois responsáveis conseguem entrar com e-mails diferentes.
- [ ] Um visitante não autenticado não consegue alterar produtos pela interface nem pelas APIs.
- [ ] Primeiro responsável cadastra peça com foto e valor e publica.
- [ ] Segundo responsável vê a mesma peça usando outro dispositivo.
- [ ] Produto aparece após F5 no catálogo público e pode ser adicionado à sacola.
- [ ] A mensagem do WhatsApp utiliza o número comercial configurado e preço atualizado.
- [ ] Marcar uma peça como reservada ou vendida impede adicioná-la à sacola.
- [ ] Produto oculto ou rascunho não aparece para visitantes.
- [ ] A primeira conta altera o preço; uma edição antiga no segundo navegador não o sobrescreve sem aviso.
- [ ] Uma foto de rascunho não pode ser consultada anonimamente pela API do Storage.

## Cuidados de segurança

- Nunca compartilhe as senhas; cada responsável deve usar sua própria conta.
- Ative autenticação adicional, se disponível, e mantenha acesso seguro ao Supabase e GitHub.
- Nunca hospede fotos de rascunhos em buckets públicos. O SQL cria bucket **privado**.
- Em produção, revise política de privacidade, contatos da empresa e informações comerciais reais.
- Para muitas centenas de peças, implemente paginação do banco de dados antes de superar os limites atuais de 500 produtos públicos e 1000 privados.
- A Fase 2 (PDV/financeiro) e a Fase 3 (etiquetas) **não estão implementadas**.

## Publicação fora do GitHub Pages

Também pode publicar os mesmos arquivos em Cloudflare Pages, Netlify ou hospedagens estáticas. Não é preciso Next.js nem servidor Node nesta versão, pois toda autorização privada é verificada pelo Supabase/PostgreSQL e não por JavaScript do visitante.
