# MVP-SCOPE — Gerenciador de Entregas para Condomínios

## O que está no MVP

### MUST HAVE — Sem isso o produto não funciona

| #    | Feature                                                  | Justificativa                                   |
| ---- | -------------------------------------------------------- | ----------------------------------------------- |
| M-01 | Cadastro e autenticação de moradores (JWT)               | Base de tudo                                    |
| M-02 | Fluxo de aprovação de cadastro pelo síndico/subsíndico   | Controle de acesso ao condomínio                |
| M-03 | Cadastro de blocos e apartamentos pelo síndico           | Sem estrutura, não dá para registrar encomendas |
| M-04 | Registro de encomenda recebida com código de retirada    | Core do produto                                 |
| M-05 | Confirmação de retirada via código                       | Core do produto — garante a segurança da troca  |
| M-06 | Notificação por e-mail ao dono quando encomenda chega    | Sem isso o dono não sabe que a encomenda chegou |
| M-07 | Notificação por e-mail na aprovação/rejeição de cadastro | Feedback essencial ao morador                   |
| M-08 | Expiração de código em 24h com reenvio sob demanda       | Segurança básica                                |

### SHOULD HAVE — Importante, mas não trava o lançamento

| #    | Feature                                                            | Justificativa                                  |
| ---- | ------------------------------------------------------------------ | ---------------------------------------------- |
| S-01 | Prazo de guarda com alerta ao dono e síndico                       | Resolve problema real de encomendas acumuladas |
| S-02 | Foto e descrição opcionais na encomenda                            | Reduz ambiguidade na hora de buscar            |
| S-03 | Histórico de encomendas por morador                                | Rastreabilidade — esperado pelos usuários      |
| S-04 | Dashboard para síndico/subsíndico (pendências e encomendas ativas) | Visibilidade para o administrador              |
| S-05 | Alerta ao síndico após 48h sem aprovar cadastro pendente           | Evita moradores travados no limbo              |

### COULD HAVE — Backlist para a V1.1

| #    | Feature                             | Justificativa                                               |
| ---- | ----------------------------------- | ----------------------------------------------------------- |
| C-01 | Push notification                   | Infraestrutura adicional — e-mail é suficiente para validar |
| C-02 | Filtros avançados no histórico      | Útil, mas não urgente                                       |
| C-03 | Upload para S3 (nuvem)              | Storage local resolve no MVP                                |
| C-04 | Painel de relatórios para o síndico | Não é crítico para o fluxo principal                        |

---

## O que NÃO está no MVP

| Feature                                           | Motivo da exclusão                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| Multi-tenant (múltiplos condomínios)              | Aumenta complexidade desnecessariamente antes de validar o produto |
| WhatsApp notifications                            | Depende de API paga (Twilio/Z-API) — sem ROI validado              |
| App mobile nativo                                 | Web responsivo é suficiente para validação                         |
| Entregador como ator do sistema                   | Fora do fluxo — entregadores já têm seus próprios apps             |
| Pagamentos / monetização                          | Projeto em fase de validação                                       |
| Self-service de condomínio (signup de condomínio) | Multi-tenant — V2                                                  |

---

## Hipóteses a Validar com o MVP

| #    | Hipótese                                                                                       | Como validar                                                    |
| ---- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| H-01 | Moradores vão registrar encomendas de forma consistente se o processo for simples o suficiente | Taxa de encomendas registradas vs. total de entregas no período |
| H-02 | O sistema de código de retirada é intuitivo e não gera fricção                                 | Taxa de confirmações bem-sucedidas na primeira tentativa        |
| H-03 | O síndico consegue manter aprovações em dia sem sobrecarga                                     | Tempo médio de aprovação de cadastros                           |
| H-04 | A notificação por e-mail é suficiente para o MVP (sem push/WhatsApp)                           | Tempo médio entre registro e retirada da encomenda              |

---

## Critérios de Sucesso do MVP

- [ ] Fluxo completo funciona de ponta a ponta: registro → notificação → retirada via código
- [ ] Nenhuma encomenda fica sem rastreabilidade (sem dono identificado)
- [ ] Síndico consegue gerenciar moradores sem suporte técnico
- [ ] Sistema funciona de forma estável para 1 condomínio com até 100 apartamentos
