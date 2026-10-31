# Blockcraft 1.2: Fundação Estável (atualização incremental)

Este pacote parte do **Blockcraft 1.1.1 existente**. Preserva o Babylon.js, os modelos de criaturas, os três modos, mineração e ciclo dia/noite. Não substitui o jogo por uma demonstração.

## Recursos implementados nesta etapa

- Painel de configurações: distância de renderização 3×3/5×5/7×7 chunks, sensibilidade horizontal/vertical, FOV e duração de um dia (5–40 minutos; padrão 20).
- Controles: Ctrl para correr e Shift para andar devagar/agachar (ainda sem reduzir fisicamente o collider).
- Exportação de mundo para JSON e importação após confirmação, com validação básica e limite de 25 MB.
- Salvamento automático e manual centralizados, com dados de progresso das fases.
- Cabeçalho e versão atualizados para 1.2.

## Limitações reconhecidas

- **REA**: não há binário REA nem uma instalação local de Minecraft disponibilizada. Nenhuma engenharia reversa foi realizada.
- O mundo, os fluidos, as criaturas e a física permanecem sistemas simplificados do 1.1.1, não equivalentes ao Minecraft.
- Ainda não há multiplayer, circuitos, inventário 9 slots completo, crafting 3×3 ou fluido volumétrico propagado.
- Modos adicionais e física avançada continuam pendentes; não há promessa de comportamento que não tenha sido implementado.
- O Babyon.js é carregado via CDN e a versão Web exige internet no primeiro acesso.
- A importação altera a gravação local do navegador. Faça backup antes.

## Rodar

Use um servidor estático (ex.: `python -m http.server 8080` no diretório e abra http://localhost:8080). Para GitHub Pages use o workflow Web. Para Android o pacote conserva a estrutura Capacitor e Actions anterior; compilação real ainda não foi executada nesta entrega.

## Próximas etapas técnicas

1. Colisão voxel em eixo vertical, queda/dano e física com testes em navegador.
2. Separar mundo, chunks, controle, criaturas e salvamento em módulos testáveis.
3. Migrar persistência para IndexedDB com migração e validação de backup.
4. Modelo de fluido por células, IA com navegação e controles por bioma/luz.
5. Inventário/crafting/progressão e testes automatizados de gameplay.
