# Blockcraft 0.3 — Babylon.js

Nova base do jogo com mundo voxel renderizado em partes, os personagens Ângelo e Valentina (avatares simplificados) e câmera alternável.

## Como jogar

- **V**: primeira/terceira pessoa. No celular use **📷 Câmera**.
- **WASD**: movimentar; **mouse** para olhar após clicar no jogo; **Espaço**: pular; **Shift**: correr.
- **Clique esquerdo** quebra blocos; **clique direito** coloca blocos; **1 a 5** seleciona materiais.
- **Celular:** joystick esquerdo, arraste o lado direito para olhar, botões Pular/Quebrar/Colocar.
- **💾** salva. Há salvamento automático a cada 30 segundos e ao sair.

## Mundo aberto

Chunks de 12×12 blocos; área ativa de 5×5 chunks; terreno determinístico; mudanças ficam no armazenamento local do navegador. O modo Sobrevivência é apenas uma opção de menu experimental nesta base, sem crafting, vida ou inimigos completos.

## Instalação Web

GitHub Pages: Settings → Pages → Source: **GitHub Actions**. Ao enviar para `main`, o workflow `web.yml` gera e publica arquivos estáticos. `index.html` carrega Babylon.js por CDN, portanto a conexão é necessária para o primeiro carregamento.

Para executar localmente em máquina com Node:

```
python -m http.server 8080
```

Abra http://localhost:8080. Também pode usar `npm run serve` após `npm install`.

## APK Android

Workflow **Gerar APK Blockcraft Babylon** usa Capacitor para encapsular a versão Web e gerar um APK **debug**. Depende de conexão à internet no aparelho para carregar o Babylon.js pelo CDN e de conectividade no GitHub para dependências. A compilação não foi validada neste ambiente. Não existe integração com AdMob nesta versão. Para monetizar, use um plugin nativo específico e implemente consentimento/privacidade.

## Limitações atuais

Protótipo em Babylon.js. Avatares geométricos simplificados, não modelos 3D fotográficos; colidir lateralmente com construções, geração de árvores/cavernas, crafting, online e multiplayer não estão completos. Modo sobrevivência experimental. Recomenda-se primeiro validar jogabilidade e desempenho, depois acrescentar os outros sistemas.
