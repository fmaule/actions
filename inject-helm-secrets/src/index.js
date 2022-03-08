const core = require('@actions/core');
const fs = require('fs').promises
const path = require('path')

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
const escapeRegExp = (string) => string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  
const writeFile = async (filePath, data) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, data)
}

const setOutputResult = async (result) => {
  core.setOutput('result', result)

  const outputFile = core.getInput('_output-file')

  if (outputFile) {
    await writeFile(outputFile, result)
    core.info(`Injected secrets into ${outputFile}`)
  }
}

const main = async () => {
  const inputFile = core.getInput('_input-file')
  const secrets = JSON.parse(core.getInput('_secrets-json'))
  const formatKey = core.getInput('_format-key')

  let secretsYaml = await fs.readFile(inputFile, 'utf8')

  for (const [key, value] of Object.entries(secrets)) {
    const newKey = formatKey.replace('key', key)
    const pattern = new RegExp(escapeRegExp(newKey), 'gi')
    // NOTE: Replace with value in function syntax to prevent special patterns replacement
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_a_parameter
    secretsYaml = secretsYaml.replace(pattern, () => value)
  }
  
  await setOutputResult(secretsYaml)
}

main().catch(err => core.setFailed(err.message))