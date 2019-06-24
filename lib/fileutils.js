const fs     = require('fs-extra');
const path   = require('path');
const { debug } = require('./logger');

async function listContentRecursive(dir) {
  debug('Listing content of \'' + dir + '\' recursively...');
  const data = await walkRecursive(dir);
  data.forEach(item => {
    debug('- ' + item);
  });
}

async function walkRecursive(dir) {
  let results = [];

  const list = await fs.readdirSync(dir);
  let pending = list.length;

  if (!pending) {
    return results;
  }

  await list.forEach(async (file) => {
    file = path.resolve(dir, file);
    const stat = await fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results.push(file);
      const recResults = await walkRecursive(file);
      results = results.concat(recResults);
      if (!--pending) {
        return results;
      }
    } else {
      results.push(file);
      if (!--pending) {
        return results;
      }
    }
  });
  return results;
}

module.exports = {
  listContentRecursive,
}