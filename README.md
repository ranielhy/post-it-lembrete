# Post-it Lembrete

Aplicativo Linux de post-its coloridos, independentes e sempre visíveis.

## Executar

```bash
npm install
npm start
```

Os lembretes são salvos automaticamente na pasta de dados do usuário do Electron.

## Gerar instaladores

```bash
npm ci
npm run dist
```

Os pacotes AppImage e `.deb` serão criados em `dist/`.

Para gerar e validar o pacote Snap:

```bash
npm ci
npm run dist:snap
```

O `electron-builder` está fixado na versão 26.0.12 porque as versões 26.15.x
geram um Snap inválido: os scripts de inicialização ficam presos dentro do
arquivo `snap-template-electron-4.0-2-amd64.tar`. O comando `dist:snap` também
verifica o conteúdo do pacote e falha antes da publicação se esse problema
voltar a ocorrer. A validação requer o pacote `squashfs-tools`.
# post-it-lembrete
