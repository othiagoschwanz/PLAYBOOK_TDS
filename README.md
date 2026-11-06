# PLAYBOOK TDS 🎧

### Transforme seus MP3 em uma experiência de audiolivro. Grátis, no seu aparelho.

**PLAYBOOK** é um player gratuito, com interface pensada para escutar livros, aulas, palestras e outros áudios longos. Abra seus próprios MP3 e outros formatos de áudio compatíveis, marque trechos, ajuste a velocidade e retome a escuta exatamente de onde parou.

**Sem mensalidades. Sem conta obrigatória. Sem anúncios. Funciona 100% offline.**

[![Abrir Player Online](https://img.shields.io/badge/▶_Abrir_Online-GitHub_Pages-baff38?style=for-the-badge&logo=googlechrome&logoColor=black)](https://othiagoschwanz.github.io/PLAYBOOK_TDS/)
[![Estrelas](https://img.shields.io/github/stars/othiagoschwanz/PLAYBOOK_TDS?style=for-the-badge&label=Estrelas%20no%20GitHub)](https://github.com/othiagoschwanz/PLAYBOOK_TDS)
[![Licença MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-2ea043?style=for-the-badge)](LICENSE)
[![Gratuito](https://img.shields.io/badge/Gratuito-Sempre-77dd44?style=for-the-badge)](#pre%C3%A7o-e-privacidade)

> ⭐ **Gostou do projeto? [Deixe sua estrela neste repositório](https://github.com/othiagoschwanz/PLAYBOOK_TDS)!** É a forma gratuita de apoiar, incentivar melhorias e ajudar outras pessoas a encontrarem este player.

---

## 🚀 Como usar agora mesmo (Versão Online / PWA)

Você **não precisa instalar programas ou servidores** para começar:

1. Acesse **[https://othiagoschwanz.github.io/PLAYBOOK_TDS/](https://othiagoschwanz.github.io/PLAYBOOK_TDS/)** no celular ou computador.
2. *(Opcional, recomendado no celular)*: Toque em **Compartilhar / Menu do Navegador** e selecione **"Adicionar à Tela de Início"** ou **"Instalar Aplicativo"**. O player funcionará como um app nativo, com ícone próprio e tela cheia.
3. Clique em **＋ Adicionar MP3 ao Aparelho** e selecione seus arquivos de áudio.
4. **Pronto!** O arquivo é guardado no armazenamento seguro do seu navegador (**IndexedDB**). Você pode fechar a aba, desligar a internet ou reiniciar o aparelho: seu audiolivro continua guardado e continuará exatamente no segundo em que você pausou.

---

## ✨ Superpoderes de Audiolivro

- 💾 **Armazenamento Seguro Local (IndexedDB):** Adicione seus MP3 uma vez. Eles ficam salvos no seu aparelho sem precisar reenviar o arquivo toda vez que abrir o app.
- ⏱️ **Memória de Ponto Exato:** Salva automaticamente o segundo onde você parou. Volte horas ou dias depois e retome com um clique.
- ⚡ **Velocidade com Preservação de Pitch:** Acelere para 1,25×, 1,5×, 1,75×, 2× ou 2,5× sem ficar com "voz fina de esquilo".
- 🔄 **Saltos Rápidos:** Botões dedicados de −15 segundos (para rever uma frase que perdeu) e +30 segundos.
- 🌙 **Modo Sono (Sleep Timer):** Programe para pausar automaticamente em 15, 30, 45, 60 minutos ou ao final do livro.
- ♧ **Marcações (Bookmarks):** Salve trechos e insights importantes com marcação temporal em 1 clique.
- 📴 **100% Offline:** Uma vez carregado, funciona em modo avião, sem sinal de celular ou sem gastar sua franquia de dados móveis.
- 🎧 **Controle na Tela de Bloqueio (Media Session):** Pause, continue e pule trechos diretamente pela tela bloqueada do celular ou pelos botões do fone Bluetooth.
- 🗑️ **Gerenciador de Espaço:** Remova qualquer audiolivro do aparelho a qualquer momento em um clique.

---

## 📥 Downloads e Instaladores Nativos

Caso prefira rodar como aplicativo executável independente no computador ou celular:

| Plataforma | Formato previsto | Situação |
| :--- | :--- | :--- |
| 📱 **Web / PWA (Qualquer aparelho)** | Navegador / PWA | ✅ **Disponível online agora** |
| 🪟 Windows | Instalador `.exe` (Electron) | ⏳ Em preparação / Código disponível |
| 🤖 Android | Aplicativo `.apk` (Capacitor) | ⏳ Em preparação / Código disponível |
| 🍎 macOS | Aplicativo `.dmg` (Electron) | ⏳ Em preparação / Código disponível |
| 🐧 Linux | `.AppImage` (Electron) | ⏳ Em preparação / Código disponível |

**Acessos úteis:** [📦 Ver releases e downloads](https://github.com/othiagoschwanz/PLAYBOOK_TDS/releases) · [⬇️ Baixar o código-fonte](https://github.com/othiagoschwanz/PLAYBOOK_TDS/archive/refs/heads/main.zip) · [⭐ Dar estrela no GitHub](https://github.com/othiagoschwanz/PLAYBOOK_TDS)

---

## ☁️ Google Drive — Opcional

O PLAYBOOK foi desenhado prioritariamente para funcionar de forma privada com seus arquivos locais. 
No entanto, também conta com módulo opcional para conexão direta à **Google Drive API** na versão web, caso deseje carregar arquivos diretamente da sua nuvem Google configurando um OAuth Client ID em `config.js`.

---

## 🔒 Preço e Privacidade

- **Custo do PLAYBOOK:** R$ 0; código 100% aberto sob licença MIT.
- **Privacidade total:** Seus áudios nunca são enviados para servidores de terceiros. Ficam armazenados exclusivamente no seu próprio dispositivo.
- **Sem anúncios ou rastreamento:** Zero telemetria, zero anúncios invasivos.

---

## 🛠️ Como rodar e compilar pelo código-fonte

Para desenvolvedores que queiram testar ou compilar localmente:

```sh
# Instalar dependências
npm install

# Executar testes automatizados
npm test

# Rodar servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:5173**.

Para gerar o pacote estático para deploy:
```sh
npm run build:web
```

---

## ⭐ Apoie o projeto

Se este player for útil nos seus estudos ou momentos de leitura, a melhor forma de ajudar é **[clicar na estrelinha (Star) no topo desta página](https://github.com/othiagoschwanz/PLAYBOOK_TDS)**. Isso ajuda o projeto a crescer e alcançar mais pessoas!

---

## 👨‍💻 Sobre o Criador

**Thiago Dias Schwanz** é um dos primeiros desenvolvedores *Vibe Coding* do Brasil e desenvolvedor do método *Flow Coding*. É CEO da **Jubarthi** (uma das maiores empresas de marketing médico do País) e Fundador do **BRAIN — Núcleo Brasileiro de Inteligência Artificial**.
