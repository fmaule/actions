const core = require('@actions/core');
const fs = require('fs').promises
const yaml = require('js-yaml');

const main = async () => {
    const secretsYamlFile = core.getInput('helm-secrets-yaml')
    const secretsYaml = await fs.readFileSync(secretsYamlFile, 'utf8')
    const strippedYaml = secretsYaml.replace(/\{\{[^{}]*\}\}/g, '')
    const { stringData } = yaml.load(strippedYaml)
    const regexp = /\${(.*?)\}/
    const secretVars = Object.values(stringData).map(v => regexp.exec(v)[1]).join(',')
    core.setOutput('secret-vars', secretVars);
}

main().catch(err => core.setFailed(err.message))