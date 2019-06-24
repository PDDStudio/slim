const download = require('download');
const decompress = require('decompress');
const ProgressBar = require('progress');
const fs     = require('fs-extra');
const path   = require('path');

const env = require('./env');
const { info, isDebugEnvironment, debug, error } = require('./logger');
const { slimdir } = env.vars();
const { listContentRecursive } = require('./fileutils');


const tmpDir = path.join(slimdir, 'dl-tmp');
const tmpFileName = 'syslinux-isolinux-tmp.zip';
const tmpFilePath = path.join(tmpDir, tmpFileName);

const archiveDownloadUrl = process.env.SYSLINUX_ARCHIVE_DOWNLOAD_URL;

async function downloadBuildDependencies(targetDir) {
  const url = archiveDownloadUrl;
  const result = await downloadArchive(url);
  if (result && result.success) {
    await extractArchive(result.destination, targetDir);
    if (isDebugEnvironment()) {
      await listContentRecursive(targetDir);
    }
  } else {
    error('It seems like something went wrong while downloading build dependencies');
  }
}

async function downloadArchive(url) {
  info('downloading syslinux/isolinux archive');
  await fs.ensureDirSync(tmpDir);
  await fs.emptyDir(tmpDir);

  const bar = new ProgressBar('[:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: 0
  });

  await download(url, tmpDir, { filename: tmpFileName })
          .on('response', res => {
            // console.log(`Size: ${res.headers['content-length']}`);
            bar.total = res.headers['content-length'];
            res.on('data', data => bar.tick(data.length));
          });

  const exists = await fs.existsSync(tmpFilePath);
  if (exists) {
    debug('archive successfully downloaded.');
  }

  return { 
    success: exists,
    destination: tmpFilePath,
  };
}

async function extractArchive(archivePath, destination) {
  debug('extracting archive from ' + archivePath + ' to ' + destination);
  info('extracting files from archive...');

  try {
    await decompress(archivePath, destination);
    return true;
  } catch(error) {
    error(error);
    return false;
  }
}

module.exports = downloadBuildDependencies;
