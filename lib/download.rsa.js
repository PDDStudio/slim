const download = require('download');
const ProgressBar = require('progress');
const fs     = require('fs-extra');
const path   = require('path');

const { info, debug } = require('./logger');

const rsaBaseUrl = process.env.RSA_KEY_BASE_URL;
const rsaKeyFileName = 'baker_rsa';
const rsaPublicKeyFileName = 'baker.pub';

async function downloadRSA(targetDir, opts) {
  const { fileName } = opts;

  if (!fileName || (fileName !== rsaKeyFileName || fileName !== rsaPublicKeyFileName)) {
    throw new Error('Invalid name for rsa file! Should be either \'' + rsaKeyFileName + '\' or \'' + rsaPublicKeyFileName + '\'');
  }

  info('downloading RSA Key \'' + fileName + '\'');
  
  const bar = new ProgressBar('[:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: 0
  });

  await download(rsaBaseUrl + fileName, targetDir, { filename: fileName })
          .on('response', res => {
            bar.total = res.headers['content-length'];
            res.on('data', data => bar.tick(data.length));
          });
  const outputLocation = path.join(targetDir, fileName);
  const exists = await fs.existsSync(outputLocation);
  if (exists) {
    debug('successfully downloaded \'' + fileName + '\'!');
  } else {
    error('unable to download file: \'' + fileName + '\'!');
  }

  return {
    success: exists,
    destination: outputLocation,
  }
}

module.exports = downloadRSA;