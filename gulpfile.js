var gulp = require('gulp');
var browserify = require('gulp-browserify');

// Browserify: pipes all Angular client js into one file
gulp.task('browserify', function () {
    return gulp
        .src('./angular.js')
        .pipe(browserify())
        .pipe(gulp.dest('./public/bin'));
});

// Watch: If any changes done to watched file, browserify again
gulp.task('watch', function () {
    gulp.watch([
            './angular.js',
            './controllers.js',
            './services.js',
            './directives.js'
        ],
        ['browserify']);
});
