const { AutoLanguageClient } = require("atom-languageclient")

class IntelephenseLanguageClient extends AutoLanguageClient {
  getGrammarScopes() {
    return ['text.html.php']
  }
  getLanguageName() {
    return 'PHP'
  }
  getServerName() {
    return "Intelephense"
  }
  startServerProcess() {
    return super.spawnChildNode([require.resolve("intelephense"), "--stdio"])
  }
  getInitializeParams(projectPath, process) {
    const params = super.getInitializeParams(projectPath, process)

    params.initializationOptions = {
      licenseKey: atom.config.get('ide-intelephense.licenseKey'),
      globalStoragePath: atom.config.get('ide-intelephense.globalStoragePath'),
      storagePath: atom.config.get('ide-intelephense.storagePath'),
    }

    return params
  }
}

module.exports = new IntelephenseLanguageClient()
