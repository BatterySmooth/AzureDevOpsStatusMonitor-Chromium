import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: 'src/worker/background.ts',
    output: {
      file: 'build/worker/background.js',
      format: 'esm'
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json'
      }),
      copy({
        targets: [
          { src: 'src/manifest.json', dest: 'build' },
          { src: 'src/icons/*', dest: 'build/icons' },
          { src: 'src/images/*', dest: 'build/images' }
        ]
      })
    ]
  },
  {
    input: 'src/popup/popup.ts',
    output: {
      file: 'build/popup/popup.js',
      format: 'esm'
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json'
      }),
      copy({
        targets: [
          { src: 'src/popup/popup.html', dest: 'build/popup' },
          { src: 'src/popup/popup.css', dest: 'build/popup' }
        ]
      })
    ]
  }
];