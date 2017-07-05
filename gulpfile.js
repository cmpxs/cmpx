var gulp = require('gulp'),
    typescript = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync')
    rollup = require('rollup'),
    rollupTypescript = require('rollup-plugin-typescript2');

gulp.task('browser', function(cb){

    var port = 2200;
    var wb = browserSync.create('browser1');

    var wbOpt = {
        server:'./test',
        ui: {
            port: port + 1,
            weinre: {
                port: port + 2
            }
        },
        //观察文件变化，自动刷新，去掉不会刷新
        files: ['./dist/browser/**', './test/**'],
        port: port,
        open: false,// "external",
        //startPath: '/demo/box.html'
        startPath: 'index.html'
    };
    //console.log('wbOpt', wbOpt);
    wb.init(wbOpt,cb); //end site.init

});

var tsBrowserProject = typescript.createProject('tsconfig-browser.json'),
    tsBrowserSrc = ['src/*.ts','src/testing/*.ts'];
gulp.task('tsc-browser', function () {
    return gulp.src(tsBrowserSrc)
        .pipe(sourcemaps.init())
        .pipe(tsBrowserProject())
        .js.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./test/scripts'));
});

gulp.task('watch-browser', function(){
    gulp.watch(tsBrowserSrc, function(){
        var time = new Date();
        console.log(`[${_toTimeStr2Len(time.getHours())}:${_toTimeStr2Len(time.getMinutes())}:${_toTimeStr2Len(time.getSeconds())}] ====================================`);
        gulp.start('tsc-browser');
    });
});


var _toTimeStr2Len = function(n){
    var s = n.toString();
    return (s.length < 2) ? '0'+s : s;
};
gulp.task('default', ['tsc-browser'], function () {
    gulp.start(['watch-browser', 'browser']);
});

gulp.task('build', function () {
    return rollup.rollup({
        entry: "./index.ts",
        plugins: [
            rollupTypescript({
                tsconfig: './tsconfig-build.json'
            })
        ]
    }).then(function (bundle) {
        bundle.write({
            format: "umd",
            moduleName: "cmpxs.cmpx",
            dest: "./dist/bundles/cmpx.umd.js",
            sourceMap: true
        });
    })
});

gulp.task('todemo', function () {
    return gulp.src(['dist/**'])
        .pipe(gulp.dest('../cmpx-demo/node_modules/cmpx'));
});

gulp.task('tonpm', function () {
    return gulp.src(['dist/**'])
        .pipe(gulp.dest('../cmpx-npm/cmpx'));
});

gulp.task('tomvc', function () {
    return gulp.src(['dist/**'])
        .pipe(gulp.dest('../cmpx-mvc/node_modules/cmpx'));
});
