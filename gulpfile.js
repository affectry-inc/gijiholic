
var gulp = require("gulp");
var gls = require("gulp-live-server");
var sass = require("gulp-sass");
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var babelify = require('babelify');
var browsersync = require('browser-sync');

gulp.task('sass', function() {
  gulp.src('./src/sass/**/*.sass')
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(gulp.dest('./public'));
});

gulp.task('concat', function() {
  browserify({
    entries: ['./src/js/main.js'],
    debug : !gulp.env.production
  }).transform(babelify, { presets: ["react"] })
    .bundle()
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
  gulp.watch("./src/js/**/*.js", ['concat']);
  gulp.watch("./src/sass/**/*.sass", ['sass']);
});

//EADDRINUSEエラーの時プロセスを終了させる
// ps aux | grep node
// sudo kill -9 XXXXX
