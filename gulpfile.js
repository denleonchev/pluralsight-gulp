const gulp = require('gulp')
const args = require('yargs').argv
const del = require('del')
const wiredep = require('wiredep')
const browserSync = require('browser-sync')
const $ = require('gulp-load-plugins')({ lazy: true })

const config = require('./gulpConfig')()

const port = process.env.PORT || config.defaultPort

const log = (msg) => {
  if(typeof msg === 'object') {
    for (let prop in msg) {
      if(msg.hasOwnProperty(prop)) {
        $.util.log($.util.colors.blue(prop, msg[prop]))
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg))
  }
}

const changeEvent = (event) => {
  var srcPattern = new RegExp('/.*(?=/' + config.saurce + ')/')
  log('File' + event.path.replace(srcPattern, '') + ' ' + event.type)
}

const startBrowswerSync = () => {
  if(browserSync.active){
    return
  }
  log(`Starting browswer-sync on port ${port}`)
  gulp.watch([config.less], ['styles'])
    .on('change', (event) => {
      changeEvent(event)
    })
  const options = {
    proxy: `localhost:${port}`,
    port: 3000,
    files: [
      `${config.client}/**/*.*`,
      `!${config.less}`,
      `${config.temp} + **/*.css`
    ],
    ghostMode: {
      clicks: true,
      location: false,
      forms: true,
      scroll: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'debug',
    logPrefix: 'gulp-patterns',
    notify: true,
    reloadDelay: 1000
  }
  browserSync(options)
}

gulp.task('styles', ['clean-styles'], () => {
  log('Converting LESS --> CSS')
  return gulp
    .src(config.less)
    .pipe($.plumber())
    .pipe($.less())
    .pipe($.autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
    .pipe(gulp.dest(config.temp))
})

const clean = (path, done) => {
  log(`Removing ${path}`)
  del(path).then(() => {
    done()
  })
}

gulp.task('clean-styles', (done) => {
  log('Deleting generated CSS')
  clean(`${config.temp}/**/*.css`, done)
}) 

gulp.task('less-watcher', () => {
  gulp.watch([config.less], ['styles'])
})

gulp.task('wiredep', () => {
  log('Adding bower\'s JS and CSS and custom JS to index\.html')
  const options = config.getWiredepDefaultOptions()
  const wiredep = require('wiredep').stream

  return gulp
    .src(config.index)
    .pipe(wiredep(options))
    .pipe($.inject(gulp.src(config.js)))
    .pipe(gulp.dest(config.client))

})

gulp.task('inject', ['wiredep', 'styles'], () => {
  log('Adding custom CSS to index\.html')

  return gulp
    .src(config.index)
    .pipe($.inject(gulp.src(config.css)))
    .pipe(gulp.dest(config.client))

})

gulp.task('serve-dev', ['inject'], () => {
  log('Serving dev build')
  const isDev = true

  const nodeOptions = {
    script: config.nodeServer,
    delayTime: 1,
    env: {
      'PORT': port,
      'NODE_ENV': isDev ? 'dev' : 'build'
    },
    watch: [config.server]
  }

  return $.nodemon(nodeOptions)
    .on('restart', ['vet'], (ev) => {
      log('****** restarting')
      log(`files changed on restart:\n ${ev}`)
      setTimeout(() => {
        browserSync.notify('reloading now ...')
        browserSync.reload({ stream: false })
      }, config.browserReloadDelay)
    })
    .on('start', () => {
      log('****** starting')
      startBrowswerSync()
    })

    .on('crash', () => {
      log('****** crashed')
    })

    .on('exit', () => {
      log('****** exited')
    })


})

gulp.task('vet', () => {
  log('Checking by jshint and jscs...')
  return gulp
    .src(config.allJs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'))
})