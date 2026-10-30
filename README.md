# Blockcraft 0.2: Mundo Aberto

Godot 4.4.1, projeto para Android e navegador, com Ângelo e Valentina.

## O que mudou

- **Chunks de 16 x 16 blocos**: a área de 5 x 5 chunks acompanha o jogador. Gera apenas um chunk por frame para distribuir o trabalho.
- **Mundo procedural determinístico**: as mesmas coordenadas e seed produzem os mesmos terrenos.
- **Descarregamento de regiões distantes**, liberando a malha e os blocos dessas regiões.
- **Salvamento compacto**: somente alterações do jogador, não o mapa completo. Funciona mesmo depois que os chunks são descarregados.
- **Android e Web**: workflows distintos geram APK de teste e publicam Web no GitHub Pages.

## Para jogar

Abra `project.godot` com Godot 4.4.1, execute F6/F5. Escolha Ângelo ou Valentina e modo Criativo ou Sobrevivência. WASD, mouse e espaço no desktop; controles táteis na tela do Android. No navegador móvel, teste o desempenho e a orientação.

## GitHub Pages

Em **Settings > Pages**, selecione **GitHub Actions** como fonte. Envie `main`; a ação `Publicar Blockcraft Web` vai exportar o jogo para https://DisneyMjr.github.io/Blockcraft/ (se o repositório for público e com esse nome). Para exportar localmente instale os templates Web e use o preset `Web` do Godot.

## Android

A ação `Gerar APK Blockcraft` gera `Blockcraft-debug.apk`, se o projeto exportar corretamente. Pode exigir configurações do SDK/keystore do runner. Ainda não há AdMob integrado: requer plugin Android específico e configuração apropriada.

## Limitações

- A versão é um protótipo, com raio de visão de 2 chunks (aprox. 80 x 80 blocos); o mundo cresce sob demanda enquanto o jogador avança.
- Não existe servidor/multiplayer nem sobrevivência avançada. Árvores na borda de chunks podem ter folhas incompletas e malhas de borda podem gerar faces extras.
- A geração usa geometria e colisores por chunk na thread principal, distribuída por frames. Em aparelhos fracos, precisa de otimizações de malha (greedy meshing, LOD, workers quando disponíveis).
- Salvamento 0.1: tenta migrar blocos construídos acima da superfície; construções subterrâneas antigas podem não migrar.
- O export Web exige WebAssembly e WebGL2; pode ter diferenças de desempenho e suporte em navegadores móveis.
