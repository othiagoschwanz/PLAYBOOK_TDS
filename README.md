# PLAYBOOK TDS 🎧

### Transforme seus MP3 em uma experiência de audiolivro. Grátis, no seu aparelho.

**PLAYBOOK** é um player gratuito, com interface pensada para escutar livros, aulas, palestras e outros áudios longos. Abra seus próprios MP3 e outros formatos de áudio compatíveis, marque trechos, ajuste a velocidade e retome a escuta de onde parou.

**Sem mensalidades. Sem conta obrigatória. Sem servidor obrigatório para reproduzir arquivos locais.**

[![Estrelas](https://img.shields.io/github/stars/othiagoschwanz/PLAYBOOK_TDS?style=for-the-badge&label=Estrelas%20no%20GitHub)](https://github.com/othiagoschwanz/PLAYBOOK_TDS)
[![Licença MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-2ea043?style=for-the-badge)](LICENSE)
[![Gratuito](https://img.shields.io/badge/Gratuito-Sempre-77dd44?style=for-the-badge)](#pre%C3%A7o-e-privacidade)

> ⭐ **Gostou da ideia? [Dê uma estrela neste repositório](https://github.com/othiagoschwanz/PLAYBOOK_TDS/stargazers)!** É a forma gratuita de apoiar e dar visibilidade ao projeto. Você pode baixar o código independentemente de dar uma estrela.

## 📥 Downloads e versões

**Situação atual: versão V02 em desenvolvimento.** O código-fonte está disponível. Os instaladores para uso geral **ainda não foram publicados nem homologados**. Acompanhe a página de versões para saber quando houver pacotes prontos.

| Plataforma | Formato previsto | Situação |
| :--- | :--- | :--- |
| 🪟 Windows | Instalador `.exe` | ⏳ Em preparação |
| 🤖 Android | Aplicativo `.apk` | ⏳ Em preparação; exige assinatura e testes em celular |
| 🍎 macOS | Aplicativo `.dmg` | ⏳ Em preparação; pode exigir assinatura/notarização |
| 📱 iPhone e iPad | Aplicação web instalável (PWA) ou app iOS | ⏳ Em preparação; distribuição nativa segue regras da Apple |
| 🐧 Linux | `.AppImage` | ⏳ Em preparação |

**Acessos úteis:** [📦 Ver downloads e versões](https://github.com/othiagoschwanz/PLAYBOOK_TDS/releases) · [⬇️ Baixar o código-fonte](https://github.com/othiagoschwanz/PLAYBOOK_TDS/archive/refs/heads/main.zip) · [⭐ Dar estrela](https://github.com/othiagoschwanz/PLAYBOOK_TDS)

⚠️ A página de versões pode estar vazia. **Não existe botão de instalação ativa enquanto o respectivo pacote não tiver sido efetivamente publicado.** Os arquivos gerados pelo fluxo de prévia são experimentais.

## ✨ Funcionalidades da versão atual

- Reproduzir MP3, M4A, M4B e outros formatos aceitos pelo navegador ou sistema.
- Pausar, continuar, avançar 30 segundos e voltar 15 segundos.
- Selecionar velocidades de 0,75× a 2,5×.
- Registrar o ponto de escuta e criar marcações.
- Buscar títulos na biblioteca selecionada.
- Interface responsiva, com controles de mídia onde o aparelho oferecer suporte.
- Usar arquivos locais sem precisar contratar armazenamento ou criar conta no PLAYBOOK.
- Integração **opcional** com Google Drive: por seletor de arquivos do sistema; na versão web, uma conexão direta pode ser configurada por quem hospedar o projeto.

**Limitação importante:** após fechar e reabrir o app, pode ser necessário selecionar os arquivos locais novamente. O progresso e as marcações ficam salvos **no mesmo aparelho/navegador**, mas ainda não há sincronização entre aparelhos. Reprodução em segundo plano e instaladores precisam ser validados em dispositivos reais.

## ▶️ Como usar

1. Abra a versão compatível com seu aparelho (quando disponibilizada), ou execute a versão web localmente.
2. Clique em **Adicionar MP3** e escolha seus arquivos de áudio.
3. Selecione um título e pressione **▶**.
4. Ajuste a velocidade, avance/retroceda ou use **Marcar posição** para guardar um trecho.
5. Se o arquivo estiver no Google Drive, use a opção **Arquivos** do seu aparelho, quando ela oferecer integração com o Drive. Dependendo do sistema, ele poderá baixar o MP3 antes de abrir.

O PLAYBOOK **não converte texto em voz, não cria narração por IA e não altera o conteúdo do MP3**. Ele oferece recursos de audiolivro para arquivos de áudio que você já possui.

## ☁️ Google Drive — opcional

Cada pessoa usa os próprios arquivos. No Android ou iPhone, o acesso ao Drive pode depender do aplicativo Google Drive e do seletor de documentos do sistema.

A conexão direta à **Google Drive API** é um recurso opcional para a versão web. Quem publicar sua própria instância precisará configurar um **OAuth Client ID** para o endereço HTTPS utilizado, habilitar a Drive API e observar o processo de consentimento/verificação do Google. O arquivo [`config.example.js`](config.example.js) mostra o formato esperado. **Jamais inclua senhas, client secrets ou tokens no código público.**

A integração direta com login Google em apps nativos ainda não está pronta. Nenhuma conta pessoal do desenvolvedor é necessária para usar seus arquivos locais.

## 🔒 Preço e privacidade

- **Custo do PLAYBOOK:** R$ 0; o código está disponível sob licença MIT.
- **Arquivos locais:** o player usa os arquivos escolhidos no próprio aparelho, sem enviá-los a um servidor do desenvolvedor.
- **Progresso e marcações:** armazenados localmente pelo aplicativo/navegador, onde houver suporte.
- **Google Drive:** caso conectado, o acesso ocorre com autorização da própria conta do usuário. O Google aplica suas próprias regras e limites; a API pode consumir rede e dados móveis.
- **Hospedagem:** não é necessária para os instaladores locais. Para uma PWA acessível pela internet, é necessário um endereço HTTPS público, que pode usar uma hospedagem estática gratuita sujeita a termos e limites.

## 🛠️ Rodar pelo código-fonte

Para desenvolvedores, é necessário **Node.js 22+** e um navegador moderno.

```sh
npm install
npm test
npm run dev
```

Acesse **http://localhost:5173**. O arquivo `config.js` não é enviado ao GitHub: para desenvolvimento local, copie `config.example.js` para `config.js` e mantenha `googleClientId` em branco se não precisar do Google Drive.

Para montar os arquivos web estáticos:

```sh
npm run build:web
```

Os arquivos ficam em `dist/web/` com configuração neutra, sem vinculação à conta do desenvolvedor.

### Preparação dos instaladores

O projeto contém estruturas de compilação para Electron (Windows/macOS/Linux) e Capacitor (Android/iOS). Essas estruturas precisam de ferramentas e validação próprias de cada plataforma:

- Windows: `npm run build:windows`.
- Android: `npm run mobile:android:init`, `npm run mobile:sync` e compilação com Android SDK.
- macOS: `npm run build:mac`, em ambiente compatível.
- Linux: `npm run build:linux`.
- iOS: `npm run mobile:ios:init` e Xcode no macOS, seguindo as regras da Apple.

O workflow [Preparar instaladores (prévia)](.github/workflows/build-preview.yml) pode ser executado manualmente no GitHub Actions. **Resultados da prévia não equivalem a um lançamento validado.** As versões definitivas exigem testes e assinatura consistente, especialmente no Android.

## ❓ Perguntas frequentes

**Preciso pagar para ouvir?** Não. O PLAYBOOK é gratuito; sua conexão de internet ou seu provedor de armazenamento podem ter custos próprios.

**Preciso cadastrar meu Gmail?** Não. Arquivos locais funcionam sem login.

**Funciona sem internet?** Arquivos locais podem ser reproduzidos offline. Arquivos do Drive precisam estar acessíveis ou previamente baixados.

**Qualquer MP3 funciona?** O objetivo é suportar arquivos MP3 compatíveis. Arquivos corrompidos, protegidos por DRM ou codecs não suportados podem falhar.

**O app transforma um PDF em voz?** Não. O PLAYBOOK reproduz áudio já existente, como MP3.

**Vai lembrar onde parei?** O progresso é salvo no aparelho/navegador. Atualmente você pode precisar escolher o arquivo novamente quando reabrir.

**Ouvirei no celular, mesmo longe do computador?** Sim, desde que o arquivo esteja acessível no celular ou por um serviço conectado e a versão escolhida funcione no aparelho.

**Vai sincronizar entre meu Windows e o iPhone?** Ainda não. O progresso atual é local.

**Já posso baixar APK ou EXE?** Ainda não há pacotes finais publicados; acompanhe a aba [Releases](https://github.com/othiagoschwanz/PLAYBOOK_TDS/releases).

**Preciso dar ⭐ para instalar?** Não é obrigatório. Mas sua estrela ajuda muito a divulgar o PLAYBOOK. [Clique aqui para apoiar](https://github.com/othiagoschwanz/PLAYBOOK_TDS).

**Posso modificar ou compartilhar o código?** Sim, conforme a [licença MIT](LICENSE).

---

**PLAYBOOK TDS** · Player gratuito de audiolivros · Desenvolvido com tecnologias web modernas e ferramentas multiplataforma.

[⭐ Apoie com uma estrela](https://github.com/othiagoschwanz/PLAYBOOK_TDS) · [📦 Acompanhe os lançamentos](https://github.com/othiagoschwanz/PLAYBOOK_TDS/releases)
