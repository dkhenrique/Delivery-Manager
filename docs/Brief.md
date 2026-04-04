# BRIEF — Gerenciador de Entregas para Condomínios

## Problema

Condomínios sem portaria presencial não têm um processo confiável para registrar e comunicar o recebimento de encomendas entre moradores, resultando em encomendas perdidas, informações apagadas e falta de rastreabilidade.

## Solução

Aplicação web que digitaliza o fluxo de recebimento e retirada de encomendas entre moradores, com geração de código de confirmação, notificações por e-mail e controle administrativo pelo síndico e subsíndico.

## Público-Alvo

Condomínios residenciais sem portaria presencial, com moradores que dependem uns dos outros para receber encomendas.

**Atores do sistema:**

- **Síndico / Subsíndico** — administram o condomínio, aprovam cadastros e monitoram encomendas
- **Morador** — registra encomendas recebidas e retira as próprias

## Diferencial Competitivo

Não existe solução dedicada e acessível para esse fluxo específico. O mercado usa grupos de WhatsApp, quadros físicos ou planilhas — todos sem rastreabilidade, sem confirmação de retirada e sem histórico.

## Modelo de Negócio

Projeto inicial para portfólio e validação. Potencial futuro de monetização via plano SaaS por condomínio (multi-tenant na V2).

## Métricas de Sucesso do MVP

- 100% das encomendas registradas têm confirmação de retirada via código
- Taxa de aprovação de cadastros pelo síndico em menos de 48h
- Zero encomendas "perdidas" (sem histórico de destino)
- Tempo de registro de uma encomenda inferior a 2 minutos
