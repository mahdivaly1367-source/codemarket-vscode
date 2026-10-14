const esbuild = require('esbuild');

const watch = process.argv.includes('--watch');
const options = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  outfile: 'dist/extension.js',
  external: ['vscode'],
  sourcemap: true,
  minify: false,
  logLevel: 'info'
};

if (watch) {
  esbuild.context(options)
    .then((context) => context.watch())
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
} else {
  esbuild.build(options).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
