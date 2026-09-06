# Segurança do ListaViva

## Modelo de acesso

O ListaViva não possui contas. O UUID enviado em `X-Device-Id` funciona como credencial do criador e precisa permanecer privado. Não publique esse valor em capturas, logs ou relatórios. Nomes e IDs públicos de autoria não comprovam a identidade de uma pessoa.

Um link de compartilhamento é uma credencial de edição: seu portador pode ler a lista, alterar o título e criar, editar ou excluir itens. Apenas o criador personaliza a capa, gera novos links e confirma a substituição da lista mais antiga ao atingir a cota. Renovar o link invalida o anterior, inclusive nas assinaturas em tempo real.

As respostas e os eventos expõem IDs de autoria derivados por HMAC, separados da credencial e específicos de cada lista. A chave deriva de `SECRET_KEY_BASE`; mantenha esse segredo estável entre processos e protegido. Rotacioná-lo muda os IDs públicos, mas não revoga UUIDs de dispositivos.

## Proteções e alcance

- Até 230 itens por lista e 30 listas por identidade do navegador, com controle de concorrência no PostgreSQL. Não há limpeza retroativa por essas cotas.
- Substituição da lista mais antiga em transação, mediante ID e versão confirmados. Alterações na lista exigem nova confirmação; uma criação inválida não apaga dados.
- Rate limiting por IP: 60 tentativas de criação/hora, 60 gerações de link/hora, 600 requisições de API/5 minutos e 60 handshakes WebSocket/minuto. A margem de tentativas de criação permite apresentar e confirmar a substituição após criar 30 listas.
- Corpos de escrita da API limitados a 32 KiB antes do processamento de parâmetros; validação de conteúdo e metadados também no modelo.
- UUIDs privados não são serializados; parâmetros sensíveis são filtrados dos logs Rails e a identificação de conexões usa um ID aleatório independente.
- Respostas privadas sem armazenamento em cache; CSP, bloqueio de incorporação em frames e política de referência definidos em `frontend/public/_headers`.

As cotas por dispositivo não impedem alguém de gerar outra identidade. Rate limiting em memória é local ao processo e reinicia junto com ele; antes de escalar a API horizontalmente, use um armazenamento compartilhado para os contadores. Limites não substituem permissões, monitoramento ou proteção de borda.

## Cuidados de publicação

1. Publique backend e frontend da mesma versão: o contrato de autoria usa `created_by_id`, `updated_by_id` e `participant_id`. Abas com o bundle antigo devem ser recarregadas.
2. Mantenha `FRONTEND_URL` restrito às origens legítimas para CORS e WebSocket. Não use curingas em produção.
3. Ao mudar `PUBLIC_API_URL`, atualize também as origens HTTP e WebSocket em `connect-src` no arquivo `_headers`. Confira os cabeçalhos servidos após o deploy.
4. Verifique a proteção da API separadamente da proteção do site: uma regra no domínio do frontend não demonstra cobertura do endereço direto da API no Render. Valide também quais proxies e cabeçalhos de IP a hospedagem encaminha antes de alterar `trusted_proxies`.
5. Não habilite logs de depuração em produção. Configure também os logs de proxy/hospedagem para não reter credenciais em URLs, cabeçalhos ou corpos; o filtro Rails não controla os logs externos.
6. Mantenha backups com acesso restrito e confira a rotina de limpeza de listas expiradas.

## Credenciais antigas e incidentes

Remover a exposição de uma credencial não revoga cópias obtidas anteriormente. Se houver suspeita de comprometimento de um UUID, trocar links compartilhados não basta: é necessária uma migração/revogação da identidade afetada com um plano para recuperar o acesso legítimo ao histórico. Não invalide todas as identidades nem apague históricos sem planejar essa recuperação.

Não inclua tokens, UUIDs privados ou conteúdo real de listas em issues públicas. Para relatar uma suspeita, use o contato indicado na página de termos do app e compartilhe detalhes sensíveis somente por um canal privado acordado com o mantenedor.
