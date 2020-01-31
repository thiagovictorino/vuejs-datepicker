import path from 'path'
import {terser} from 'rollup-plugin-terser'
import vue from 'rollup-plugin-vue'
import babel from 'rollup-plugin-babel'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import commonjs from 'rollup-plugin-commonjs'

export default [{
  input: path.join(__dirname, '..', 'src', 'components', 'Datepicker.vue'),
  output: [
    {
      file: 'dist/vuejs-datetimepicker.js',
      format: 'umd',
      name: 'vuejsDatetimepicker'
    },
    {
      file: 'dist/vuejs-datetimepicker.common.js',
      format: 'cjs'
    },
    {
      file: 'dist/vuejs-datetimepicker.esm.js',
      format: 'es'
    }
  ],
  plugins: [
    vue({css: true}),
    postcss({plugins: [autoprefixer()]}),
    commonjs(),
    babel({exclude: 'node_modules/**'})
  ]
}, {
  input: path.join(__dirname, '..', 'src', 'components', 'Datepicker.vue'),
  output: {
    file: 'dist/vuejs-datetimepicker.min.js',
    format: 'umd',
    name: 'vuejsDatetimepicker'
  },
  plugins: [
    vue({css: true}),
    postcss({plugins: [autoprefixer()]}),
    commonjs(),
    terser(),
    babel({exclude: 'node_modules/**'})
  ]
}]
