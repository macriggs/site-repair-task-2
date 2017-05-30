/*
* Configured by Sean Ockert 2017
* Compile SCSS to CSS, remove unused CSS styles, minify and concatenate JS, compress HTML and append a version number to CSS and JS includes to bust cache
* All the final files end up in the /dist directory
* This will install all plugins (or use package.json): npm install jshint gulp-concat gulp-uglify gulp-rename gulp-uglifycss gulp-htmlmin gulp-uncss gulp-compass gulp-rev-append --save-dev
*/

// Include gulp
var gulp = require('gulp');

// Include Plugins
var uncss = require('gulp-uncss');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var htmlmin = require('gulp-htmlmin');
var compass = require('gulp-compass'); // alternatively use sass: var sass = require('gulp-sass');
var rev = require('gulp-rev-append');
var critical = require('critical');

// Compile Sass, remove unused classes and minify resulting CSS
gulp.task('css', function() {
  return gulp.src('scss/**/*.scss')
  .pipe(compass({ // Compile with Compass
    config_file: './config.rb',
    css: 'css',
    sass: 'scss',
    sourcemap: true
  }))
  .on('error', swallowError)
  .pipe(gulp.dest('css'))
  .pipe(uncss({ // Remove unwanted css
    html: ['index.html'], // add all pages that use this stylesheet
    ignore: [
      /\.open/
    ]
  }))
  .pipe(gulp.dest('css'))
  .pipe(uglifycss({ // Minify CSS
    "max-line-len": 80
  }))
  .pipe(rename('style.min.css'))
  .pipe(gulp.dest('css'))
});

// Compress HTML file
gulp.task('html', function() {
  return gulp.src('index.html')
  .pipe(htmlmin({
    collapseWhitespace: true,
    removeCommentsFromCDATA: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyJS: true,
    minifyCSS: true
  }))
  .pipe(rename('index.min.html'))
  .pipe(gulp.dest('./'))
});

// Lint JS
gulp.task('lint', function() {
  return gulp.src('js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('js', function() {
  return gulp.src('js/**/*.js')
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename('scripts.min.js'))
    .pipe(uglify())
    .on('error', swallowError)
    .pipe(gulp.dest('dist/js'));
});

// Add revision number to JS and CSS
gulp.task('rev', function() {
  gulp.src('index.html')
    .pipe(rev())
    .pipe(gulp.dest('.'));
});

// Output CSS for styling only elements that appear above the fold
gulp.task('critical', function (cb) {
  critical.generate({
    base: './',
    src: 'index.html',
    css: ['css/style.css'],
    dimensions: [{
      width: 320,
      height: 480
    }],
    dest: 'dist/css/critical.css',
    minify: true,
    extract: false,
    ignore: ['font-face']
  });
});

// Watch files For Changes
gulp.task('watch', function() {
  gulp.watch('scss/**/*.scss', ['css', 'rev']); //, 'critical'
  gulp.watch('js/**/*.js', ['js', 'rev']); //'lint',
  gulp.watch('*.html', ['html']);
});

// Default task
gulp.task('default', ['css', 'js', 'rev', 'html', 'watch']); // 'critical', 'lint',

function swallowError (error) {
  console.log(error.toString());
  this.emit('end');
}