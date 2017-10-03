/**
 * Modified by Svetlana on 03.10.2017
 */
'use strict';
var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('gulp-rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    cssnano = require('gulp-cssnano'),
    plumber = require('gulp-plumber'),
    spritesmith = require('gulp.spritesmith'),
    svgSprite = require('gulp-svg-sprite');

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'public/',
        js: 'public/js/',
        css: 'public/css/',
        img: 'public/img/',
        fonts: 'public/fonts/',
        svgIcons: 'public/'
    },
    prod: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'prod/',
        js: 'prod/js/',
        css: 'prod/css/',
        img: 'prod/img/',
        fonts: 'prod/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: ['src/js/*.js'],//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/sass/style.scss',
        sprite_scss: 'src/sass/utils/',//сюда складываются иконки для спрайтоа
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        sprite_img: 'src/icons/*.png', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*',
        svgIcons: 'src/icons/*.svg'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/sass/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        svgIcons: 'src/icons/*.svg'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./public"
    },
    tunnel: false,
    host: 'localhost',
    port: 9005,
    logPrefix: "Anton.erof"
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('html:prod', function () {
    gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.prod.html));
});


gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(rigger())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('js:prod', function () {
    gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(uglify())
        .pipe(gulp.dest(path.prod.js));
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            sourceMap: false,
            errLogToConsole: true,
            outputStyle: 'expanded'
        }))
        .pipe(prefixer({ browsers: ['last 3 versions', 'IE >= 10'], cascade: false }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('style:prod', function () {
    gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(sass({
            sourceMap: false,
            errLogToConsole: true
        }))
        .pipe(prefixer({ browsers: ['last 3 versions', 'IE >= 10'], cascade: false }))
        .pipe(cssnano())
        .pipe(gulp.dest(path.prod.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('image:prod', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.prod.img));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('fonts:prod', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.prod.fonts))
});

// Создание спрайтов
gulp.task('sprite-create', function () {

    var spriteData = gulp.src(path.src.sprite_img)
        .pipe(spritesmith({
            imgName: '../img/spritesheet.png',
            cssName: '_sprite.scss',
            cssFormat: 'scss',
            padding: 5
        }));

    spriteData.img.pipe(gulp.dest(path.build.img));

    spriteData.css.pipe(gulp.dest(path.src.sprite_scss));

    return spriteData;
});

gulp.task('sprite-create:prod', function () {

    var spriteData = gulp.src(path.src.sprite_img)
        .pipe(spritesmith({
            imgName: '../img/spritesheet.png',
            cssName: '_sprite.scss',
            cssFormat: 'scss',
            padding: 5
        }));

    spriteData.img.pipe(gulp.dest(path.prod.img));

    spriteData.css.pipe(gulp.dest(path.src.sprite_scss));

    return spriteData;
});


gulp.task('svg:build', function () {
    return gulp.src(path.src.svgIcons)
        .pipe(svgSprite({
            mode: {
                symbol: {
                    dest: "./",
                    sprite: 'img/sprite'
                }
            },
            shape: {
                spacing: {
                    padding: 0
                }
            },
            variables: {
                mapname: "sprite"
            }
        }))
        .pipe(gulp.dest('./public'));
});

gulp.task('build', [
    'html:build',
    'js:build',
    'sprite-create',
    'svg:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

gulp.task('prod', [
    'html:prod',
    'js:prod',
    'sprite-create:prod',
    'svg:build',
    'style:prod',
    'fonts:prod',
    'image:prod'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.src.sprite_img], function(event, cb) {
        gulp.start('sprite-create');
    });
    watch([path.src.svgIcons], function(event, cb) {
        gulp.start('svg:build');
    });
});


gulp.task('default', ['build', 'webserver', 'watch']);