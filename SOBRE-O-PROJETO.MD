📋 Visão Geral
Um sistema web mobile-friendly focado na gestão de frequência e engajamento para ministérios religiosos. O objetivo é substituir a chamada manual por um sistema de QR Code, onde o próprio voluntário registra sua presença e progresso semanal.

🛠️ Funcionalidades Principais
1. Módulo de Check-in (Público)
Acesso via QR Code: O voluntário escaneia um código físico no local do ensaio/evento.

Seleção de Nome: Uma lista dinâmica com os nomes dos membros (sem necessidade de login para rapidez).

Dados de Engajamento: * Checkbox: "Realizou a meditação da semana?"

Campo numérico: "Quantos versículos decorou?"

Geolocalização (Opcional): Validar se o check-in está sendo feito no raio da igreja.

2. Calendário e Agendamento
Gestão de Datas: Cadastro de ensaios regulares (ex: sábados às 14h) e eventos extraordinários (apresentações, congressos).

Visualização: Calendário mensal para os usuários verem as próximas escalas.

3. Gestão de Usuários e Níveis de Acesso
Nível User (Logado): Pode ver seu histórico pessoal de presenças e versículos, além de editar seu perfil.

Nível Admin: * Gerenciar membros (Adicionar/Remover).

Configurar datas no calendário.

Visualizar o Dashboard.

Login Social/E-mail: Integração com Firebase Auth ou Supabase para login via E-mail/Senha e possivelmente Google.

4. Dashboard Administrativo (Painel do Líder)
Estatísticas Gerais: % de presença do mês.

Ranking de Engajamento: Quem mais decorou versículos ou realizou meditações (útil para premiações ou incentivos).

Alertas: Identificar membros ausentes há mais de 2 semanas.