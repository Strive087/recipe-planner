const path = require('path');

const config = {
  projectName: 'recipe-planner',
  date: '2026-3-12',
  designWidth: 750,
  deviceRatio: { 750: 1, 375: 2, 640: 2.34, 828: 1.81 },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: { patterns: [], options: {} },
  framework: 'react',
  compiler: {
    prebundle: { enable: false }
  },
  mini: {
    postcss: {
      pxtransform: { enable: true, config: {} },
      url: { enable: true, config: { limit: 1024 } }
    },
    webpackChain: (chain) => {
      chain.resolve.alias.set('@', path.resolve(__dirname, 'src'));
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    router: { mode: 'hash' },
    postcss: {
      autoprefixer: { enable: true, config: {} }
    },
    webpackChain: (chain) => {
      chain.resolve.alias.set('@', path.resolve(__dirname, 'src'));
    }
  }
};

module.exports = (merge) => {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
