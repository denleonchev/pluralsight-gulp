module.exports = () => {
  const client = './src/client'
  const clientApp = `${client}/app`
  const temp = './temp'
  const server = './src/server'
  return {
    allJs: [
      './*.js',
      './src/**/*.js'
    ],
    browserReloadDelay: 1000,
    client,
    css: `${temp}/styles.css`,
    index: `${client}/index.html`,
    js: [
      `${clientApp}/**/*.module.js`,
      `${clientApp}/**/*.js`,
      `!${clientApp}/**/*.spec.js`,
    ],
    less: `${client}/styles/styles.less`,
    temp,
    bower: {
      json: require('./bower.json'),
      directory: './bower_components',
      ignorePath: '../..'
    },
    defaultPort: 7203,
    nodeServer: `${server}/app.js`,
    server,
    getWiredepDefaultOptions() {
      const { json, directory, ignorePath } = this.bower
      return {
        bowerJson: json,
        directory: directory,
        ignorePath: ignorePath
      }
    }
  }
}