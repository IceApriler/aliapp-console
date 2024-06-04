const gulp = require('gulp')
const path = require('path')
const fs = require('fs-extra')
const sass = require('gulp-sass')
const rename = require('gulp-rename')
const minimist = require('minimist')
const child_process = require('child_process')
const config = require('./gulp.config')
const utils = require('./gulp.utils')
const watch = require('gulp-watch')

sass.compiler = require('node-sass')

/** 编译scss文件 */
gulp.task('compile:scss', function () {
  return gulp
    .src(utils.makeGlob(config.scssPath))
    .pipe(sass().on('error', sass.logError))
    .pipe(
      rename((path) => {
        path.extname = '.acss'
      }),
    )
    .pipe(gulp.dest(config.srcPath))
})
/** 编译scss文件 */
gulp.task('compile:examplescss', function () {
  return gulp
    .src([utils.makeGlob(config.exampleScssPath), '!' + utils.makeGlob(config.exampleAliappConsolePath)])
    .pipe(sass().on('error', sass.logError))
    .pipe(
      rename((path) => {
        path.extname = '.acss'
      }),
    )
    .pipe(gulp.dest(config.examplePath))
})

/** 监听scss */
gulp.task('watch:scss', function (done) {
  watch(utils.makeGlob(config.scssPath), gulp.series('compile:scss'))
  watch(utils.makeGlob(config.exampleScssPath), gulp.series('compile:examplescss'))
  done()
})

gulp.task('copy:comp', function () {
  return gulp.src(utils.makeGlob(config.aliappConsolePath)).pipe(gulp.dest(utils.makeGlob(config.exampleAliappConsolePath)))
})

gulp.task('watch:comp', function () {
  watch(utils.makeGlob(config.aliappConsolePath), gulp.series('copy:comp'))
})

/** 修改app.json */
const addPathToAppJson = (params) => {
  fs.readFile(`${config.srcPath}/app.json`, function (err, data) {
    if (err) {
      return console.error(err)
    }
    const dataJson = JSON.parse(data.toString())
    dataJson.pages.push(params)
    const str = JSON.stringify(dataJson, null, 2)
    fs.writeFile(`${config.srcPath}/app.json`, str, function (err) {
      if (err) {
        console.error(err)
      }
    })
  })
}

/**
 * 执行命令行
 * @param {String}} cmd 命令
 */
function exec(cmd) {
  const cliback = child_process.exec(cmd)
  console.log(`[执行脚本] ${cmd}`)
  cliback.stdout.on('data', (data) => {
    const lines = data
      .toString()
      .split(/[\n|\r\n]/)
      .filter((i) => i)
    const contents = lines.join('\r\n')
    console.log(contents)
  })
  cliback.stderr.on('data', (data) => {
    const lines = data
      .toString()
      .split(/[\n|\r\n]/)
      .filter((i) => i)
    const contents = lines.join('\r\n')
    console.log(contents)
  })
}

/** 开发模式 */
gulp.task('default', gulp.series('compile:scss', 'compile:examplescss', 'copy:comp', 'watch:scss', 'watch:comp'))
