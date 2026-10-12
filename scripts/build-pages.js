const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const defaultBasePath = '/my_portfolio/lib/accessible-react-modal';
const argument = process.argv.slice(2).find((value) => value.startsWith('--base-path='));
const requestedBasePath = process.env.DOCS_BASE_PATH || argument?.slice('--base-path='.length) || defaultBasePath;

if (!requestedBasePath.startsWith('/') || requestedBasePath.includes('..') || /[?#\\]/.test(requestedBasePath)) {
  console.error('DOCS_BASE_PATH must be an absolute URL path without query, hash, backslash, or parent segments.');
  process.exit(1);
}

const basePath = `/${requestedBasePath.split('/').filter(Boolean).join('/')}`;
const outputPath = path.join('build', 'pages', ...basePath.slice(1).split('/'));
const reactScriptsBuild = require.resolve('react-scripts/scripts/build');

const result = spawnSync(process.execPath, [reactScriptsBuild], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PUBLIC_URL: basePath,
    BUILD_PATH: outputPath,
  },
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status || 1);

fs.writeFileSync(path.join(outputPath, '.nojekyll'), '');
console.log(`GitHub Pages files generated at ${outputPath}`);
console.log(`Expected site path: ${basePath}/`);
