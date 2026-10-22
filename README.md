# BRECHÓ PARREIRA — Fase 1

**Plataforma de vitrine e catálogo público, sacola com WhatsApp e painel privado de dois proprietários.** Visual editorial creme, verde profundo e dourado discreto; interface responsiva.

## O que está implementado

- Loja pública: início, catálogo, categorias, página individual, galeria, pesquisa (sem diferenciar acentos), filtros e ordenação, sacola persistida no navegador, WhatsApp com mensagem detalhada, contato, institucional e informações de privacidade.
- Administração: autenticação individual com Supabase Auth; acesso exclusivo ao papel `OWNER` validado no banco; visão geral; criar/editar/publicar/ocultar/reservar/vender/arquivar/excluir produtos; múltiplas fotografias, reordenação, foto principal, rascunhos, categorias, informações da vitrine e histórico.
- Persistência: PostgreSQL/Supabase Storage privado; metadados, fotos e alterações reais compartilhados entre dispositivos; códigos únicos `BP-000001...`; datas de atualização; controles de concorrência por versão em uma função SQL.
- Segurança: RLS para dados e Storage; visão pública sem IDs dos proprietários, contas somente por configuração manual, inexistência de senhas/chaves administrativas no frontend.

**Não incluído nesta fase:** PDV, vendas registradas, financeiro, custos, gestão avançada de estoque, etiquetas ou códigos de barras.

## Comece por aqui

Leia **[docs/CONFIGURACAO.md](docs/CONFIGURACAO.md)**. É preciso conectar seu projeto Supabase, executar a migração SQL, criar os dois responsáveis manualmente e publicar os arquivos do site.

O site deliberadamente **não exibe dados fictícios**. Antes da configuração do Supabase, a vitrine mostra o estado vazio e o login informa que falta conexão. O projeto contém a integração de backend, mas **não estará operacional com dados reais até você configurá-la e testá-la**.

## Estrutura

```
index.html                        Página principal
src/config.js                     URL e chave publicável do Supabase
src/main.js                       Navegação e interações
src/lib/api.js                    Banco, login, Storage e integrações
src/lib/utils.js                  Utilitários, moeda e ícones
src/ui/public.js                  Páginas da vitrine
src/ui/owner.js                   Painel administrativo
src/styles.css                    Design responsivo
supabase/migrations/001_fase_1.sql Banco, permissões, funções e categorias
docs/CONFIGURACAO.md             Guia completo para usar e publicar
```

## Rodar localmente

Abra um terminal **dentro desta pasta** e execute:

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080/`. A conexão com Supabase requer acesso à internet (para a API e a biblioteca supabase-js, carregada sob demanda). Não abra o HTML diretamente pelo protocolo `file://`, pois imports JavaScript podem ser bloqueados.

## Arquitetura de expansão

Identificador UUID e código imutável, tabelas normalizadas de produtos/imagens/categorias, auditoria e usuários OWNER. Estrutura preparada para integrar futuras tabelas de movimentos de estoque, pedidos e etiquetas sem recadastrar produtos. Nenhuma dessas funcionalidades foi simulada nem habilitada agora.
