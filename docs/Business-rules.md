# BUSINESS-RULES — Gerenciador de Entregas para Condomínios

## 1. Papéis e Permissões

### RN-01 — Hierarquia de papéis

O sistema possui três papéis distintos:

- `ADMIN` — Síndico ou Subsíndico
- `RESIDENT` — Morador aprovado
- `PENDING` — Morador aguardando aprovação

### RN-02 — Permissões por papel

| Ação                            | ADMIN | RESIDENT | PENDING |
| ------------------------------- | ----- | -------- | ------- |
| Cadastrar blocos e apartamentos | ✅    | ❌       | ❌      |
| Aprovar/rejeitar cadastros      | ✅    | ❌       | ❌      |
| Visualizar todos os moradores   | ✅    | ❌       | ❌      |
| Visualizar todas as encomendas  | ✅    | ❌       | ❌      |
| Registrar encomenda recebida    | ✅    | ✅       | ❌      |
| Confirmar retirada via código   | ✅    | ✅       | ❌      |
| Visualizar próprias encomendas  | ✅    | ✅       | ✅      |
| Solicitar reenvio de código     | ✅    | ✅       | ❌      |

### RN-03 — Proteção do papel ADMIN

- O sistema deve ter ao menos 1 usuário com papel `ADMIN` ativo em todo momento
- A remoção ou rebaixamento do último `ADMIN` deve ser bloqueada pelo sistema
- Um `ADMIN` pode promover um `RESIDENT` a `ADMIN` (subsíndico)

---

## 2. Cadastro de Moradores

### RN-04 — Status de cadastro

Todo cadastro nasce com status `PENDING` e pode transitar para:

- `PENDING` → `APPROVED` (síndico/subsíndico aprova)
- `PENDING` → `REJECTED` (síndico/subsíndico rejeita, com justificativa obrigatória)
- `REJECTED` → `PENDING` (morador pode se re-cadastrar)

### RN-05 — Acesso com cadastro pendente

Moradores com status `PENDING` podem:

- Fazer login no sistema
- Visualizar o status do seu cadastro

Moradores com status `PENDING` NÃO podem:

- Registrar encomendas
- Confirmar retiradas
- Visualizar encomendas de outros

### RN-06 — Alerta de cadastro pendente

Se um cadastro permanecer com status `PENDING` por mais de 48 horas, o sistema deve:

1. Enviar notificação por e-mail ao síndico e ao subsíndico (se existir)
2. O alerta é enviado apenas uma vez por ciclo de 48h por cadastro pendente
3. O alerta cessa quando o cadastro for aprovado ou rejeitado

### RN-07 — Rejeição de cadastro

- A justificativa de rejeição é obrigatória
- O morador recebe notificação por e-mail com a justificativa
- O morador rejeitado pode criar um novo cadastro (novo registro no sistema)

### RN-08 — Dois moradores no mesmo apartamento

- É permitido mais de um morador aprovado para o mesmo apartamento (ex: família, casal)
- O sistema deve alertar o admin ao aprovar um segundo morador para o mesmo apto, mas não bloquear a ação

---

## 3. Estrutura do Condomínio

### RN-09 — Blocos

- A criação de blocos é opcional
- Condomínios sem blocos utilizam um bloco padrão criado automaticamente (ex: "Principal")
- Um bloco não pode ser excluído se houver apartamentos vinculados a ele

### RN-10 — Apartamentos

- Cada apartamento pertence a um bloco
- A combinação `número do apartamento + bloco` deve ser única no sistema
- Um apartamento não pode ser excluído se houver encomendas ativas vinculadas a ele

---

## 4. Encomendas

### RN-11 — Quem pode registrar

Apenas moradores com status `APPROVED` podem registrar encomendas recebidas.

### RN-12 — Destinatário válido

O apartamento e bloco informados no registro devem corresponder a um apartamento cadastrado no sistema. Caso contrário, o registro é bloqueado com mensagem de erro orientando contato com o síndico.

### RN-13 — Status da encomenda

Uma encomenda transita pelos seguintes status:

```
WAITING_PICKUP → DELIVERED
WAITING_PICKUP → OVERDUE (quando prazo de guarda vence sem retirada)
OVERDUE → DELIVERED (ainda é possível retirar mesmo após o prazo)
```

### RN-14 — Prazo de guarda

- O morador que registra define o prazo de guarda em dias (mínimo: 1, máximo: 30)
- O prazo começa a contar a partir da data/hora do registro
- Quando o prazo vence:
  1. O status muda para `OVERDUE`
  2. O sistema envia notificação de urgência ao dono da encomenda
  3. O sistema notifica o síndico e o subsíndico
  4. A notificação de prazo vencido é enviada apenas uma vez por encomenda

### RN-15 — Foto e descrição

- Foto e descrição são opcionais
- Foto: máximo 5MB, formatos aceitos: JPG, PNG, WEBP
- A descrição tem limite de 500 caracteres

---

## 5. Código de Retirada

### RN-16 — Geração do código

- O código é gerado automaticamente no momento do registro da encomenda
- O código tem 6 dígitos numéricos
- O código deve ser único entre todos os códigos ativos no sistema (não reutilizar enquanto houver outros ativos)

### RN-17 — Expiração do código

- O código expira 24 horas após sua geração
- Após a expiração, o código não pode ser utilizado para confirmar retirada
- O dono pode solicitar a geração de um novo código a qualquer momento

### RN-18 — Reenvio e regeneração

- Se o código ainda estiver válido no momento do reenvio, o sistema reenvia o mesmo código
- Se o código estiver expirado no momento do reenvio, o sistema gera um novo código e envia o novo por e-mail
- Cada solicitação de reenvio gera um novo e-mail ao dono

### RN-19 — Validação do código

- A validação do código é feita pelo morador que está guardando a encomenda
- O sistema valida: existência do código, expiração e status da encomenda (`WAITING_PICKUP` ou `OVERDUE`)
- Encomendas com status `DELIVERED` não aceitam validação de código
- Por segurança, a mensagem de erro não distingue entre "código inválido" e "código expirado" para tentativas externas
- Máximo de 5 tentativas de validação por IP a cada 15 minutos (rate limiting)

---

## 6. Notificações

### RN-20 — Gatilhos de notificação por e-mail

| Evento                                 | Destinatário                |
| -------------------------------------- | --------------------------- |
| Encomenda registrada                   | Dono da encomenda           |
| Código de retirada reenviado           | Dono da encomenda           |
| Encomenda retirada com sucesso         | Morador que guardou         |
| Cadastro aprovado                      | Morador aprovado            |
| Cadastro rejeitado (com justificativa) | Morador rejeitado           |
| Cadastro pendente há mais de 48h       | Síndico e Subsíndico        |
| Encomenda com prazo de guarda vencido  | Dono + Síndico + Subsíndico |

### RN-21 — Idempotência de notificações

- A notificação de prazo vencido é enviada apenas uma vez por encomenda
- A notificação de cadastro pendente é enviada uma vez a cada 48h enquanto pendente
- Não há reenvio automático de notificação de encomenda registrada (apenas sob demanda via "reenviar código")
