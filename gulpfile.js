var gulp = require('gulp'),
wiredep = require('wiredep').stream,
useref = require('gulp-useref'),
gulpif = require('gulp-if'),
minifyCss = require('gulp-minify-css'),
clean = require('gulp-clean'),
sass = require("gulp-sass");
concat = require("gulp-concat"),
notify = require("gulp-notify"),
prefix = require("gulp-autoprefixer"),
csscomb = require('gulp-csscomb'),
uncss = require("gulp-uncss"),
imagemin = require('gulp-imagemin'),
spritesmith = require('gulp.spritesmith'),
pngquant = require('imagemin-pngquant');

// add bower components to index.html when bower.json modify
gulp.task('bower', () => {
	gulp.src('./app/index.html')
	.pipe(wiredep({directory : "app/bower_components"}))
	.pipe(gulp.dest('./app'))
	.pipe(notify('bower done!'));
});

// compile .scss files, concat, add prefix and remove unused code
gulp.task('css', () => {
	return gulp.src('app/scss/**/*.*css')
	.pipe(concat('style.scss'))
	.pipe(sass().on('error', sass.logError))
	.pipe(prefix('last 5 version'))
	// .pipe(uncss({html: ['app/index.html']}))
	.pipe(csscomb())
	.pipe(gulp.dest('app/css'))
	.pipe(notify('css done!'));
});

// remove dist folder
gulp.task('clean', () => {
	return gulp.src('dist', {read: true})
	.pipe(clean());
});

// sprites
gulp.task('sprite', () => {
	var spriteData = 
	gulp.src('app/img/sprite/*.+(jpg|jpeg|png)') 
	.pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: 'a-sprite.scss',
		cssFormat: 'scss',
		algorithm: 'top-down',
	}));
	spriteData.img.pipe(gulp.dest('./app/css')); 
	spriteData.css.pipe(gulp.dest('./app/scss')); 
});
// build project
gulp.task('build', ['img', 'fonts', 'clean', 'csprite'], () => {
	return gulp.src('app/*.html')
	.pipe(useref())
	.pipe(gulpif('*.css', minifyCss()))
	.pipe(gulp.dest('dist'))
	.pipe(notify('build done!'));
});

// copy fonts 
gulp.task('fonts', () => {
	return gulp.src('app/fonts/*')
	.pipe(gulp.dest('dist/fonts'));
});

// compress img
gulp.task('img', () => {
	return gulp.src('app/img/*')
	.pipe(imagemin({
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	}))
	.pipe(gulp.dest('dist/img'));
});
// compress sprite
gulp.task('csprite', () => {
	return gulp.src('app/css/*.+(jpg|jpeg|png)')
	.pipe(imagemin({
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	}))
	.pipe(gulp.dest('dist/css'));
});

// watch changes
gulp.task('watch', () => {
	gulp.watch('app/scss/*.scss', ['css']);
});