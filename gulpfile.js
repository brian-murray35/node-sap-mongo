'use strict';

var gulp = require('gulp');

// Workaround for eslint bad object-assign version
Object.assign = require('object-assign');

var helper = {
    plugins: {},
    getPlugin: function (name) {
        var plugin = this.plugins[name];
        if (!plugin) {
            plugin = require(name);
            this.plugins[name] = plugin;
        }
        return plugin;
    }
};

gulp.task('default', ['build'], function () {
});

gulp.task('clean', function (done) {
    var del = helper.getPlugin('del');
    del(['coverage', 'tmp'], function (err) {
        done(err);
    });
});

gulp.task('build', ['clean', 'eslint', 'coverage'], function () {
});

gulp.task('dist', ['build'], function () {
});

gulp.task('doc', ['mddoc'], function () {
});

gulp.task('eslint', function () {
    var eslint = helper.getPlugin('gulp-eslint');
    return gulp.src(['index.js', 'gulpfile.js', 'make', 'lib/**/*.js', 'test/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('test', function () {
    return gulp.src('test/**/*.spec.js', {read: false})
        .pipe(helper.getPlugin('gulp-mocha')({slow: 200}));
});

gulp.task('coverage', ['clean'], function (done) {
    process.env.COVERAGE = true;
    var mocha = helper.getPlugin('gulp-mocha');
    var istanbul = helper.getPlugin('gulp-istanbul');
    gulp.src(['lib/**/*.js', 'index.js'])
        .pipe(istanbul()) // Covering files
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function () {
            gulp.src('test/**/*.spec.js', {read: false})
                .pipe(mocha({slow: 200}))
                .pipe(istanbul.writeReports({})) // Creating the reports after tests runned
                .on('end', done);
        });
});

gulp.task('mddoc', ['eslint'], function () {
    var gutil = helper.getPlugin('gulp-util');
    var gulpJsdoc2md = helper.getPlugin('gulp-jsdoc-to-markdown');
    var concat = helper.getPlugin('gulp-concat');

    return gulp.src(['index.js', 'lib/**/*.js'])
        .pipe(concat('API.md'))
        .pipe(gulpJsdoc2md())
        .on('error', function (err) {
            gutil.log('jsdoc2md failed:', err.message);
        })
        .pipe(gulp.dest(''));
});
