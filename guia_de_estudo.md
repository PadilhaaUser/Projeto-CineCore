# Guia de Estudo: Projeto NewFlix v2.0

Este guia foi criado para explicar detalhadamente como o novo projeto foi estruturado, quais tecnologias foram usadas, e como funcionam conceitos importantes como o **JWT** (JSON Web Token), segurança e a comunicação entre o Frontend (React) e o Backend (Node.js).

---

## 1. A Nova Arquitetura do Projeto

No projeto antigo, tudo ficava num único lugar (arquivos HTML misturados com CSS e JavaScript diretamente). Na nova versão, separamos o projeto em duas partes que conversam entre si:

1. **Frontend (React com Vite)**: 
   - É a "cara" do site. Fica na pasta `/frontend`.
   - É responsável por mostrar as telas, rodar animações, pegar os cliques do usuário e enviar pedidos para o nosso servidor.
   - Usamos o **Vite** porque ele é uma ferramenta muito rápida para preparar o React para desenvolvimento.
   - Diferente do HTML puro, no React criamos **Componentes** (como peças de Lego). Temos o componente `Navbar`, o componente `MovieCard`, etc. Juntamos essas peças para formar as páginas.

2. **Backend (Node.js com Express)**: 
   - É o "cérebro" do site, o nosso servidor. Fica na pasta `/backend`.
   - É construído em JavaScript usando o **Node.js** e o micro-framework **Express**.
   - É responsável por:
     - Ir até o banco de dados (Firebase) salvar ou buscar informações de usuários, fórum e avaliações.
     - Esconder nossas chaves (API Keys) da TMDB e OMDb. O Frontend nunca acessa a TMDB diretamente, ele pede ao Backend, e o Backend pede à TMDB usando a chave secreta.
     - Verificar quem está logado (usando o JWT).

---

## 2. Padrões de Segurança Utilizados

Hoje em dia, a segurança é primordial. Algumas práticas que aplicamos:

1. **Arquivo `.env`**:
   - É o arquivo de "variáveis de ambiente" (`Environment Variables`).
   - Nele colocamos todas as chaves secretas (API Keys, senhas do banco de dados).
   - Este arquivo **NUNCA** vai para o GitHub. Ele está listado dentro do arquivo `.gitignore` para que o Git simplesmente o ignore.
   - Em produção (quando hospedar o site na Vercel ou Render), essas chaves são colocadas nas configurações do provedor de hospedagem.

2. **Backend como Proxy**:
   - O React é rodado diretamente no navegador do usuário (no Google Chrome, por exemplo). Se colocássemos nossa chave do TMDB no React, qualquer pessoa apertando `F12` conseguiria ver a nossa chave e usá-la.
   - Para evitar isso, o React pede os filmes para o nosso próprio Backend (ex: `http://localhost:3000/api/movies/buscar`). O Backend (que ninguém enxerga o código rodando) pega sua chave do `.env`, vai na TMDB e devolve apenas o resultado limpo para o React.

3. **Criptografia de Senhas**:
   - Não salvamos as senhas dos usuários como "123456" no Firebase. Usamos uma biblioteca chamada `bcrypt` que transforma a senha em um código embaralhado (Hash) irreversível antes de salvar.

---

## 3. Entendendo o JWT (JSON Web Token)

Você pediu para explicar como funciona o **JWT**. Ele é a forma mais comum de gerenciar "sessões" (manter o usuário logado) em sistemas modernos (React + Node).

### O problema do Login Tradicional
Antigamente, quando você fazia login, o servidor criava um papelzinho (chamado *Session*) e guardava na memória dele dizendo "O usuário Paulo está logado". Ele entregava um número de protocolo (Cookie) para o seu navegador. 
O problema: se o servidor desligasse, ele perdia os "papeizinhos" da memória e todo mundo deslogava.

### A solução: JWT (O "Crachá" Autenticado)
O **JWT** resolve isso sendo um token sem estado (*stateless*).
Pense nele como um **crachá de empresa digital com assinatura**.

**Como funciona passo a passo:**
1. **O Login**: Você digita email e senha no React e clica em Entrar.
2. **A Criação do Crachá**: O Node.js confere a senha no Firebase. Se estiver correta, ele cria um token (uma longa string de texto) contendo o seu ID de usuário.
3. **A Assinatura Secreta**: O Node.js "carimba" esse token usando uma **Palavra-Passe Secreta** que só ele sabe (que fica no `.env`, chamada `JWT_SECRET`). 
4. **Devolvendo ao React**: O Node envia esse token de volta para o React. O React salva isso na memória do navegador (geralmente no *localStorage*).
5. **Usando o Crachá**: Sempre que o React for tentar postar um comentário ou criar um post no fórum, ele envia esse Token (crachá) junto na requisição (no cabeçalho `Authorization`).
6. **A Verificação**: O Node.js pega o token e confere a assinatura. Como só ele sabe a palavra-passe secreta, ele tem certeza absoluta se aquele token foi criado por ele mesmo ou se alguém tentou falsificar. Se for verdadeiro, ele libera a ação.

O JWT tem 3 partes separadas por pontos (`.`):
- **Header**: Diz que tipo de token é.
- **Payload**: O conteúdo (ex: `id_usuario: 123`).
- **Signature**: A assinatura matemática usando a senha secreta do servidor.

---

## 4. O Banco de Dados (Google Firebase - Firestore)

Para não precisar baixar o MySQL ou Postgres localmente, escolhemos o **Firebase Firestore** (um banco NoSQL na nuvem do Google).

- **NoSQL (Not Only SQL)**: Em vez de tabelas rígidas com linhas e colunas (como no Excel/SQL), ele guarda os dados como "Documentos JSON". 
- Teremos "Coleções" principais:
  - `users`: Salva dados dos usuários e as senhas (com hash).
  - `reviews`: Salva a nota, o comentário, o id do usuário e o id do filme.
  - `forum_threads`: Salva as postagens da comunidade.

Usaremos o pacote `firebase-admin` no Node.js para conectar diretamente com o banco usando credenciais seguras.

---

## Próximos Passos
O próximo passo no desenvolvimento será configurar a base de pastas e preparar as fundações desse sistema maravilhoso! Quando estiver pronto para continuar seus estudos, você pode abrir e explorar os arquivos nas pastas `backend` e `frontend`.
