# Blockcraft 0.9: Imersão Total

Atualização em Babylon.js a partir da versão 0.8, mantendo 32 criaturas procedurais, três modos de jogo, geração de mundo, dia e noite e publicação via GitHub Actions.

## Mudanças nesta versão

- Primeira pessoa com corpo 3D presente: ao olhar para baixo, o jogador vê tronco e pernas. A cabeça e o cabelo são ocultados apenas na primeira pessoa para não obstruir a visão.
- Movimento de braços e pernas sincronizado à cadência de caminhada.
- Golpe visual mais pronunciado ao minerar, com mão avançando.
- Impacto de pouso adicionado ao balanço da câmera.
- Alternância primeira/terceira pessoa pela tecla V ou pelo botão de câmera.
- Controle de intensidade de balanço mantido.

## Limitações

Os personagens e criaturas ainda são modelos geométricos simples, não modelos com esqueleto profissional ou texturas detalhadas. Esta é uma base de imersão e não uma cópia visual exata do vídeo de referência. Não há colisão física entre os membros e o cenário nem animações capturadas de movimento.

## Publicar

Copie os arquivos para a raiz do repositório Blockcraft, faça git add -A, git commit e git push. Os workflows Web e Android já estão incluídos. O APK ainda precisa ser compilado e testado no GitHub Actions.

## Testes

Validado: sintaxe JavaScript, arquivos Web e integridade do ZIP. A execução gráfica no navegador e o APK Android não foram testados.
