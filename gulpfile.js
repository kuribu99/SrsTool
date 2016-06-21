var gulp = require('gulp');
var browserify = require('gulp-browserify');

gulp.task('browserify', function () {
    return gulp
        .src('./angular.js')
        .pipe(browserify())
        .pipe(gulp.dest('./public/bin'));
});

gulp.task('watch', function () {
    gulp.watch([
            './angular.js',
            './controllers.js',
            './services.js',
            './directives.js'
        ],
        ['browserify']);
});
