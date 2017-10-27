/***** TODO: add a fonts task to deal with both our and vendors fonts *****/

const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const pump = require('pump');

const config = {
	bowserDir : 'build',
	sass : 'app/sass/*.scss',
	css : 'app/css',
	cssVendors : 'bower_components/**/*.css',
	jsWatchPath : 'app/js/src/*.js',
	jsVendors : 'bower_components/**/*.min.js',
	img : 'app/img/*.*',
	html : 'app/*.html'
}

gulp.task('browserSync', function(){
	browserSync.init({
		server: {
			baseDir: 'app',
			browser: 'google chrome',
			routes: {
		        "/bower_components": "bower_components"
		    }
		}
	})
});

gulp.task('sass', function() {
	return gulp.src(config.sass)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(config.css))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('babel', function() {
	return gulp.src(config.jsWatchPath)
		.pipe(babel())
		.pipe(gulp.dest("app/js/dist"))
		.pipe(browserSync.reload({
			stream: true
		}));
})

gulp.task('watch', function() {
	gulp.watch(config.sass, ['sass']);
	gulp.watch(config.html, browserSync.reload);
	gulp.watch(config.jsWatchPath, ['babel']);
});

gulp.task('vendorsJS', function() {
	return gulp.src(config.jsVendors)
		.pipe(gulp.dest('app/js/vendors'));
});

gulp.task('vendorsCSS', function() {
	return gulp.src(config.cssVendors)
		.pipe(gulp.dest('app/css/vendors'));
});

gulp.task('js', function(cb) {
	gulp.src('app/js/vendors/**/*.min.js')
		.pipe(gulp.dest(config.bowserDir + '/js/vendors'));

	pump([
        gulp.src('app/js/dist/*.js'),
        //uglify(),
        gulp.dest('build/js/dist')
    ],
    cb
    );
});

gulp.task('css', function() {
	gulp.src(config.css + '/*.css')
		.pipe(gulp.dest(config.bowserDir + '/css'));

	gulp.src(config.cssVendors)
		.pipe(gulp.dest(config.bowserDir + '/css/vendors'));
});

gulp.task('html', function() {
	gulp.src(config.html)
		.pipe(gulp.dest(config.bowserDir + '/'));
});

gulp.task('images', function() {
	gulp.src(config.img)
		.pipe(imagemin())
		.pipe(gulp.dest(config.bowserDir + '/img'));
});

gulp.task('default', function(callback) {
	runSequence(['sass', 'babel', 'vendorsJS', 'vendorsCSS', 'browserSync'], 'watch',
		callback
		)
});

gulp.task('build', function(callback) {
	runSequence('html', 'css', 'js', 'images', 
		callback
		)
});