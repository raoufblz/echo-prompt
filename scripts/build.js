
const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');
const manifestDir = path.join(__dirname, '..', 'manifest');

(async () => {
  await fs.emptyDir(distDir);

  for (const [target, manifestName] of [
    ['chromium', 'manifest-chromium.json'],
    ['firefox',  'manifest-firefox.json']
  ]) {
    const targetDir = path.join(distDir, target);
    await fs.copy(srcDir, targetDir);
    await fs.copy(
      path.join(manifestDir, manifestName),
      path.join(targetDir, 'manifest.json')
    );

    // zip part
    const output = fs.createWriteStream(path.join(distDir, `${target}.zip`));
    const archive = archiver('zip');
    archive.pipe(output);
    archive.directory(targetDir, false);
    await archive.finalize();
  }

  console.log('Build complete: dist/chromium.zip & dist/firefox.zip');
})();
