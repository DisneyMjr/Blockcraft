# Blockcraft 0.1: Ângelo e Valentina

Projeto original de aventura em mundo 3D de blocos, para Android, criado em **Godot 4.4.1**.

## Já implementado
- Mundo 3D procedural 40x40, árvores, montanhas e terreno com colisões
- Quebrar e colocar 8 tipos de bloco
- Escolha entre Ângelo e Valentina, companheiro voxel com roupas inspiradas nas fotos de referência
- Modos Criativo e Sobrevivência (sobrevivência **básica**, inventário limitado e vida indicativa)
- Controles touch para andar, girar a câmera, pular, colocar e quebrar blocos
- Suporte a teclado e mouse: WASD, espaço, clique esquerdo para quebrar, direito para colocar
- Salvamento local manual e carregamento por personagem/modo
- Alternância entre blocos e ciclo simples de iluminação
- GitHub Actions para gerar APK de debug sem Android Studio local

## Limites desta primeira versão
Não contém multiplayer, monstros, crafting avançado, cavernas escavadas, mundo infinito ou monetização. O AdMob do Space Wing não deve ser reutilizado neste aplicativo: é necessário cadastrar **Blockcraft** como novo aplicativo no AdMob e criar blocos próprios. A capa é uma imagem promocional, não corresponde a modelos fotorrealistas dentro do jogo.

## Como gerar o APK
1. Crie um repositório vazio no GitHub e envie o **conteúdo** desta pasta para a raiz.
2. Na aba Actions, execute **Gerar APK Blockcraft** (ou aguarde o push).
3. Na execução verde, baixe `Blockcraft-Android-APK` em Artifacts.
4. Extraia o ZIP do artifact para obter `Blockcraft-debug.apk`.

## Observação sobre a compilação
Este ambiente não dispõe de Godot/Android SDK. O workflow foi criado, mas **não foi executado**. Se o Godot apontar problemas de importação ou exportação, consulte o log do Actions e envie a mensagem de erro para corrigirmos. A publicação oficial exigirá assinatura própria, ajustes de SDK, testes reais e revisão das políticas da Google Play.

## Próximos recursos
Inventário visual, ferramentas, crafting, biomas maiores, animais, inimigos e sistema completo de sobrevivência. Depois, otimização com chunks, multiplayer e AdMob (mediante novos IDs e consentimento).
