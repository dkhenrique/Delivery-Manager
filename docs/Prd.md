# PRD — Gerenciador de Entregas para Condomínios

## 1. Visão Geral

Sistema web para gerenciamento de recebimento e retirada de encomendas em condomínios sem portaria presencial. O sistema digitaliza o fluxo que hoje acontece em quadros físicos, adicionando rastreabilidade, confirmação segura de retirada via código e notificações automáticas.

**Stack:**

- Backend: NestJS + TypeORM + PostgreSQL
- Frontend: Next.js + shadcn/ui (fase posterior)

---

## 2. Personas

### Persona 1 — Carlos, o Síndico

- **Perfil:** 45 anos, síndico voluntário, pouco tempo disponível
- **Dor:** Não sabe quantas encomendas estão acumuladas, não consegue controlar quem está cadastrado
- **Job to be done:** Manter o condomínio organizado sem precisar estar presente o tempo todo
- **Expectativa:** Aprovar cadastros rapidamente, ter visão geral do que está acontecendo

### Persona 2 — Ana, a Vizinha que Guarda

- **Perfil:** 35 anos, trabalha home office, frequentemente em casa para receber entregas
- **Dor:** Anota encomendas no quadro mas não sabe se o dono viu, às vezes guarda por semanas
- **Job to be done:** Registrar que recebeu a encomenda e se livrar dela com segurança
- **Expectativa:** Registrar rápido, ser notificada quando o dono retirar

### Persona 3 — Bruno, o Dono da Encomenda

- **Perfil:** 28 anos, recebe compras online frequentemente, nem sempre está em casa
- **Dor:** Não sabe se sua encomenda chegou, não sabe com quem está
- **Job to be done:** Saber imediatamente quando sua encomenda chegar e retirá-la com segurança
- **Expectativa:** Receber notificação, buscar no apartamento certo e confirmar a retirada

---

## 3. User Stories

### Síndico / Subsíndico

| ID    | User Story                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------ |
| US-01 | Como síndico, quero cadastrar blocos e apartamentos para que o sistema reflita a estrutura real do condomínio            |
| US-02 | Como síndico, quero aprovar ou rejeitar cadastros de moradores para controlar quem acessa o sistema                      |
| US-03 | Como síndico, quero ser notificado quando houver cadastros pendentes há mais de 48h para não deixar moradores sem acesso |
| US-04 | Como síndico, quero visualizar todas as encomendas ativas do condomínio para ter visibilidade do que está guardado       |
| US-05 | Como síndico, quero ser notificado quando uma encomenda não for retirada no prazo para tomar providências                |
| US-06 | Como síndico, quero cadastrar um subsíndico para que ele possa me auxiliar nas aprovações                                |

### Morador (quem guarda)

| ID    | User Story                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------------- |
| US-07 | Como morador, quero registrar uma encomenda recebida informando o apartamento e bloco do dono para que ele seja notificado |
| US-08 | Como morador, quero adicionar foto e descrição opcionais ao registrar para dar mais informação ao dono                     |
| US-09 | Como morador, quero confirmar a retirada ao receber o código do dono para encerrar minha responsabilidade pela encomenda   |
| US-10 | Como morador, quero visualizar as encomendas que estou guardando atualmente para ter controle do que tenho em casa         |

### Morador (dono da encomenda)

| ID    | User Story                                                                                                           |
| ----- | -------------------------------------------------------------------------------------------------------------------- |
| US-11 | Como morador, quero receber um e-mail quando uma encomenda minha chegar para saber onde buscá-la                     |
| US-12 | Como morador, quero visualizar o código de retirada da minha encomenda para apresentar ao vizinho que está guardando |
| US-13 | Como morador, quero ver o histórico das minhas encomendas para ter rastreabilidade                                   |

---

## 4. Requisitos Funcionais

### RF-01 — Autenticação e Cadastro de Usuários

- O sistema deve permitir que qualquer pessoa se registre com nome, e-mail, senha, CPF e número do apartamento/bloco
- O cadastro fica com status `PENDING` até aprovação do síndico ou subsíndico
- Usuário com cadastro `PENDING` pode fazer login mas não pode registrar encomendas
- Usuário com cadastro `REJECTED` não pode fazer login
- O síndico e o subsíndico são os únicos com o papel `ADMIN`
- O primeiro usuário a ser cadastrado como síndico deve ser configurado manualmente (seed) ou via rota protegida de setup

### RF-02 — Cadastro de Estrutura do Condomínio

- O síndico/subsíndico pode cadastrar blocos (opcional — condomínios sem blocos usam um bloco padrão)
- O síndico/subsíndico pode cadastrar apartamentos vinculados a um bloco
- Não é possível registrar encomenda para um apartamento não cadastrado

### RF-03 — Registro de Encomenda

- Apenas moradores com cadastro `APPROVED` podem registrar encomendas
- Campos obrigatórios: apartamento do destinatário, bloco do destinatário
- Campos opcionais: foto (upload de imagem), descrição
- Ao registrar, o sistema gera automaticamente um código de retirada único de 6 dígitos
- O código expira em 24h; após a expiração, um novo código deve ser gerado
- O sistema notifica o dono da encomenda por e-mail com: quem recebeu, apartamento de quem está guardando e o código de retirada
- O status inicial da encomenda é `WAITING_PICKUP`

### RF-04 — Retirada de Encomenda

- O dono apresenta o código ao vizinho que está guardando
- O vizinho que guarda insere o código no sistema para confirmar a retirada
- O sistema valida se o código está correto, não expirado e pertence a uma encomenda `WAITING_PICKUP`
- Após confirmação, o status muda para `DELIVERED`
- O sistema registra data e hora da retirada

### RF-05 — Prazo de Guarda

- O vizinho que registra a encomenda define um prazo de guarda em dias (mínimo 1, máximo 30)
- Quando o prazo expira sem retirada, o sistema envia notificação de urgência ao dono
- O sistema também notifica o síndico e o subsíndico sobre a encomenda em atraso

### RF-06 — Aprovação de Cadastros

- Síndico e subsíndico visualizam lista de cadastros pendentes
- Podem aprovar ou rejeitar, com campo de justificativa obrigatório em caso de rejeição
- Se o cadastro ficar `PENDING` por mais de 48h, o sistema reenvia notificação ao síndico e subsíndico
- O morador é notificado por e-mail tanto na aprovação quanto na rejeição

### RF-07 — Reenvio de Código

- O dono da encomenda pode solicitar reenvio do código por e-mail
- Se o código expirou, o sistema gera um novo automaticamente ao solicitar reenvio

### RF-08 — Histórico

- Cada morador visualiza o histórico completo das encomendas que recebeu e das que foram entregues a ele
- Síndico/subsíndico visualizam histórico completo do condomínio com filtros por status, data e apartamento

---

## 5. Requisitos Não-Funcionais

| ID     | Requisito                                                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-01 | Senhas devem ser armazenadas com hash bcrypt (mínimo 10 rounds)                                                                                    |
| RNF-02 | Autenticação via JWT com expiração de 7 dias                                                                                                       |
| RNF-03 | Refresh token para renovação de sessão sem novo login                                                                                              |
| RNF-04 | Todas as rotas autenticadas devem validar o papel do usuário via Guards do NestJS                                                                  |
| RNF-05 | Upload de fotos deve ter limite de 5MB por arquivo, formatos aceitos: JPG, PNG, WEBP                                                               |
| RNF-06 | E-mails transacionais enviados via serviço externo (Resend ou Nodemailer)                                                                          |
| RNF-07 | Códigos de retirada devem ser gerados com entropia suficiente para evitar força bruta (6 dígitos numéricos com rate limiting na rota de validação) |
| RNF-08 | Rate limiting na rota de validação de código: máximo 5 tentativas por IP a cada 15 minutos                                                         |
| RNF-09 | API RESTful com versionamento via prefixo `/api/v1`                                                                                                |
| RNF-10 | Variáveis sensíveis (JWT secret, credenciais de banco, chaves de e-mail) via variáveis de ambiente                                                 |

---

## 6. Integrações

| Integração                    | Finalidade                     | Observação                                    |
| ----------------------------- | ------------------------------ | --------------------------------------------- |
| PostgreSQL                    | Banco de dados principal       | Via TypeORM                                   |
| Resend (ou Nodemailer + SMTP) | Envio de e-mails transacionais | Aprovação, notificação de encomenda, rejeição |
| Multer + Disk/S3              | Upload de fotos de encomendas  | Local no MVP, S3 na V2                        |

---

## 7. Casos de Borda e Edge Cases

| Caso                                                                                 | Comportamento esperado                                                                  |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Morador tenta registrar encomenda para apartamento inexistente                       | Erro 404 com mensagem: "Apartamento não encontrado. Entre em contato com o síndico."    |
| Código de retirada expirado                                                          | Erro 410 com mensagem informando expiração e orientando solicitar reenvio               |
| Código inválido (não existe)                                                         | Erro 404 genérico — não informar se o código existe ou não (segurança)                  |
| Morador com cadastro PENDING tenta registrar encomenda                               | Erro 403: "Seu cadastro ainda não foi aprovado."                                        |
| Síndico tenta aprovar morador para apartamento já ocupado por outro morador aprovado | Sistema alerta e solicita confirmação — dois moradores no mesmo apto é válido (família) |
| Dono solicita reenvio de código com código ainda válido                              | Sistema reenvia o mesmo código sem gerar um novo                                        |
| Encomenda com status DELIVERED tenta ser confirmada novamente                        | Erro 409: "Esta encomenda já foi retirada."                                             |
| Upload de arquivo inválido (tipo ou tamanho)                                         | Erro 400 com mensagem clara sobre o limite                                              |
| Síndico removido do papel ADMIN                                                      | Deve haver ao menos 1 ADMIN ativo no sistema. Remoção do último ADMIN é bloqueada       |

---

## 8. Critérios de Aceitação por Feature

### CA-01 — Registro de Encomenda

- [ ] Encomenda só pode ser registrada por morador com status `APPROVED`
- [ ] Campos obrigatórios validados antes de salvar
- [ ] Código gerado automaticamente com 6 dígitos únicos
- [ ] E-mail enviado ao dono em até 1 minuto após registro
- [ ] Encomenda aparece na listagem do registrador com status `WAITING_PICKUP`

### CA-02 — Confirmação de Retirada

- [ ] Código válido muda status para `DELIVERED`
- [ ] Código expirado retorna erro com instrução de reenvio
- [ ] Após confirmação, encomenda some da lista de "guardando" e vai para o histórico
- [ ] Tentativas inválidas são registradas e bloqueadas após 5 tentativas

### CA-03 — Aprovação de Cadastro

- [ ] Síndico e subsíndico visualizam todos os cadastros `PENDING`
- [ ] Aprovação muda status para `APPROVED` e notifica morador por e-mail
- [ ] Rejeição exige justificativa e notifica morador por e-mail
- [ ] Após 48h sem ação, sistema reenvia alerta ao síndico/subsíndico

### CA-04 — Prazo de Guarda

- [ ] Encomenda não retirada no prazo dispara notificação ao dono
- [ ] Síndico e subsíndico são notificados no mesmo evento
- [ ] Notificação não é enviada mais de uma vez por encomenda vencida
