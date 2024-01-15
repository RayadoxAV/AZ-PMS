function init() {
  const args = process.argv;
  let binaryPath = '';

  const binaryPathIndex = args.indexOf('-b');

  if (binaryPathIndex >= 0) {
    console.log('a');

    binaryPath = args[binaryPathIndex + 1];

    if (!binaryPath) {
      console.log('Not enough arguments');
      return;
    }

    const packageFile = require('../../package.json');
    const electronVersion = packageFile.devDependencies['electron'];

    if (binaryPath === 'download') {
      console.log('download according to electron version');

      console.log(electronVersion);
    } else {
      console.log(binaryPath);
    }

  }
}

init();
