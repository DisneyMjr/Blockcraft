# Blockcraft 1.1: Sons do Mundo

Efeitos sonoros **originais e procedurais** feitos com Web Audio API. O MP4 enviado serviu como referência de categorias de sons, mas nenhum áudio do Minecraft foi copiado, extraído ou distribuído.

Inclui: passos em grama, pedra, madeira e água; quebrar madeira, folhas, terra, pedra e minerais; colocar blocos; ataque e dano; saltos e pousos; bolhas subaquáticas; lava; transição de ambiente dia/noite; recompensa. Volume e mudo no HUD, preferências armazenadas localmente. O áudio inicia após clicar em Jogar devido às regras dos navegadores.

Sons de animais e monstros disponíveis no motor de áudio para futuras ações específicas, mas ainda não foram vinculados a todos os NPCs. Sons não foram avaliados por audição no Android.

# Blockcraft 1.0 — Noite e Oceanos

Base: Blockcraft 0.9.1.

## Mudanças

- Criaturas hostis comuns só aparecem no período noturno em Mundo Aberto. Ao amanhecer, são removidas.
- Animais passivos e criaturas neutras permanecem no mapa.
- No modo Fases, inimigos aparecem em qualquer horário porque fazem parte do desafio.
- No Criativo, nenhuma criatura inicia ataques e não há afogamento.
- Água com empuxo e resistência, movimento horizontal mais lento, natação ao segurar Espaço.
- Controle esquerdo/direito: descer na água (teclado).
- Indicador de ar (20 segundos). Respiração recuperada na superfície; dano por afogamento após esgotamento.
- Mantidos três modos, 32 modelos de criaturas, árvores em blocos, câmera V e ciclo de dia/noite.

## Limitações

A simulação aquática é simplificada: não há correnteza, propagação dinâmica de líquidos, ondas físicas ou corpos rígidos flutuantes. O mundo apresenta água na região do nível do mar. A compilação Android não foi executada neste ambiente.

## Publicação

Copie o conteúdo deste pacote para a raiz do repositório, execute `git add -A`, `git commit -m "Blockcraft 1.0 - Agua e monstros noturnos"`, `git pull --rebase origin main` e `git push origin main`.
