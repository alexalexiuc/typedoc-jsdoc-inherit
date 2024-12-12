import esbuild from 'esbuild';
import defaultConfig from './esbuild.config.js';

function build() {
  console.log(`🚀 Building esm bundle for package...`);
  esbuild
    .build({
      ...defaultConfig,
      format: 'esm',
      outfile: 'dist-esm/index.mjs',
    })
    .then(() => console.log('⚡ Done'))
    .catch(() => process.exit(1));
}

build();

