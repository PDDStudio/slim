const chalk  = require('chalk');

const isDebugEnvironment = () => process.env.NODE_ENV !== 'production';

const error = e => console.error(chalk.red(e));
const info = m => console.log(chalk.yellow(m));
const ok = m => console.log(chalk.green(m));
const debug = m => {
  console.log('isDebug: ' + isDebugEnvironment() + ' NODE_ENV: ' + process.env.NODE_ENV);
  if (isDebugEnvironment()) {
    console.log(chalk.blueBright(m));
  }
}

module.exports = { error, info, ok, debug, isDebugEnvironment };
