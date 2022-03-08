const { program } = require('commander');
const shell = require("shelljs");
const fs = require('fs').promises
const yaml = require('js-yaml')

const main = async () => {
  program.option('--name <string>')
  program.parse();
  const { name } = program.opts();

  if (!name) throw new Error('Name is required :#')

  console.log(`Creating ${name}`)
  const destinationDir = `./${name}`
  shell.mkdir('-p', destinationDir)
  shell.cp('-R', '_template/*', destinationDir)

  const packageJsonFile = `${destinationDir}/package.json`
  const packageJson = require(packageJsonFile)
  const newPackageJson = { ...packageJson, name }
  fs.writeFile(packageJsonFile, JSON.stringify(newPackageJson, null, 2))

  const workspaceYamlFile = './pnpm-workspace.yaml'
  const workspaceYaml = await fs.readFile(workspaceYamlFile, 'utf8')
  const workspace = yaml.load(workspaceYaml)
  const newWorkspace = { packages: [...workspace?.packages || [], `${name}/`] }
  fs.writeFile(workspaceYamlFile, yaml.dump(newWorkspace))

  shell.exec(`pnpm --filter ${destinationDir} install`)

  console.log('🎉 DONE!')
}

main().catch(err => console.error(err))