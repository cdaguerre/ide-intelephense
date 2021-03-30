/* global atom */

const { AutoLanguageClient } = require('atom-languageclient')

class IntelephenseLanguageClient extends AutoLanguageClient {
  getGrammarScopes () {
    return ['text.html.php']
  }

  getLanguageName () {
    return 'PHP'
  }

  getServerName () {
    return 'Intelephense'
  }

  startServerProcess () {
    const childProcess = super.spawnChildNode([require.resolve('intelephense'), '--stdio'])

    if (atom.config.get('core.debugLSP')) {
      this.enableLogging(childProcess)
    }

    return childProcess
  }

  getInitializeParams (projectPath, process) {
    const params = super.getInitializeParams(projectPath, process)

    params.initializationOptions = {
      licenseKey: atom.config.get('ide-intelephense.licenseKey'),
      globalStoragePath: atom.config.get('ide-intelephense.globalStoragePath'),
      storagePath: atom.config.get('ide-intelephense.storagePath')
    }

    return params
  }

  onDidConvertAutocomplete (completionItem, suggestion /*, request */) {
    suggestion.completionItem = completionItem
  }

  onDidInsertSuggestion ({ editor /*, triggerPosition */, suggestion }) {
    const additionalTextEdits = suggestion.completionItem.additionalTextEdits

    if (!additionalTextEdits || additionalTextEdits.length === 0) {
      return
    }

    return editor.transact(() => {
      return additionalTextEdits.forEach((additionalTextEdit) => {
        editor.setTextInBufferRange(
          [
            [additionalTextEdit.range.start.line, additionalTextEdit.range.start.character],
            [additionalTextEdit.range.end.line, additionalTextEdit.range.end.character]
          ],
          additionalTextEdit.newText
        )
      })
    })
  }

  enableLogging (process) {
    const log = (std, chunk) => {
      chunk.toString().split('\n').forEach((line) => {
        try {
          console.log(std, JSON.parse(line))
        } catch {
          return false
        }
      })
    }

    process.stderr.on('data', chunk => log('err', chunk))
    process.stdout.on('data', chunk => log('out', chunk))
  }
}

module.exports = new IntelephenseLanguageClient()
