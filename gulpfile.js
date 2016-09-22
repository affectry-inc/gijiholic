
var gulp = require("gulp");
var gls = require("gulp-live-server");
var sass = require("gulp-sass");
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var babelify = require('babelify');
var browsersync = require('browser-sync');
var glob = require('glob');
var cleanCss = require('gulp-clean-css');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var plumber = require('gulp-plumber');

gulp.task('sass', function() {
  return gulp.src('./src/sass/**/*.sass')
    .pipe(plumber({
      errorHandler: function(err) {
        console.log(err.messageFormatted);
        this.emit('end');
      }
    }))
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(gulp.dest('./tmp'));
});

gulp.task('concat-css', function() {
  return gulp.src('./tmp/*.css')
    .pipe(concat('bundle.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest('./public'));
});

gulp.task('compile-sass', function(callback) {
  runSequence(
    'sass',
    'concat-css',
    callback
  );
});

gulp.task('compile-js', function() {
  srcFiles = glob.sync('./src/js/**/*.js');
  browserify({
    entries: srcFiles,
    debug : !gulp.env.production
  }).transform(babelify, { presets: ["react"] })
    .bundle()
    .on('error', function (err) {
        console.log(err.toString());
        this.emit("end");
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("./public"));
});
//browserify -t [ babelify --presets [ react ] ] main.js -o ./public/bundle.js

gulp.task('server', function() {
  gls.new('./app.js').start();

  browsersync.init({
    proxy: 'http://localhost:3000/',
    files: ['./public/**/*.*'],
    port: 3333,
    open: false,
    //logLevel: 'debug'
  });
});

// Watch
gulp.task('default', ['server'], function() {
  gulp.watch("./src/js/**/*.js", ['compile-js']);
  gulp.watch("./src/sass/**/*.sass", ['compile-sass']);
});

//EADDRINUSEエラーの時プロセスを終了させる
// ps aux | grep node
// sudo kill -9 XXXXX
