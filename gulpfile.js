let project_folder = 'dist';
let source_folder = 'src';
let fs = require('fs');

let path = {
	build: {
		html: project_folder + '/',
		css: project_folder + '/css',
		js: project_folder + '/js/',
		img: project_folder + '/img/',
		sprite: project_folder + '/img/sprite/',
		fonts: project_folder + '/fonts/',
	},
	src: {
		html: [source_folder + '/*.html', "!" + source_folder + "/html/"],
		css: source_folder + '/scss/style.scss',
		js: source_folder + '/js/script.js',
		img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
		sprite: source_folder + '/img/sprite/',
		fonts: source_folder + '/fonts/*.ttf',
	},
	watch: {
		html: source_folder + '/',
		css: source_folder + '/scss/style.scss',
		js: source_folder + '/js/',
		// sprite: source_folder + '/img/sprite/',
		img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
	},
	clean: "./" + project_folder + "/"
}


let { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require('browser-sync').create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	scss = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	gcmq = require('gulp-group-css-media-queries'),
	cleanCSS = require('gulp-clean-css'),
	rename = require("gulp-rename"),
	uglify = require('gulp-uglify-es').default,
	babel = require('gulp-babel'),
	imagemin = require('gulp-imagemin'),
	webp = require('gulp-webp'),
	webpHTML = require('gulp-webp-html'),
	webpcss = require("gulp-webpcss"),
	svgSprite = require('gulp-svg-sprite'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	ttf2woff = require('gulp-ttf2woff'),
	fonter = require('gulp-fonter');






function browserSync(params) {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/"
		},
		port: 3000,
		notify: false
	})
}



function html() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(webpHTML())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
}


function watchFiles(params) {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);
	// gulp.watch([path.watch.sprite], sprite);
}


function clean(params) {
	return del(path.clean);
}


function css() {
	return src(path.src.css)
		.pipe(
			scss({
				outputStyle: 'expanded'
			})
		)
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 15 version'],
			cascade: true,
			grid: 'autoplace'
		}))
		.pipe(
			webpcss(
				{
					webpClass: '.webp',
					noWebpClass: '.no-webp'
				}
			)
		)
		.pipe(gcmq())

		.pipe(dest(path.build.css))
		.pipe(cleanCSS())
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}


// разобраться как настраивать babel
function js() {
	return src(path.src.js)
		.pipe(fileinclude())
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(
			rename({
				extname: ".min.js"
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
}


function images() {
	return src(path.src.img)
		.pipe(
			webp({
				quality: 70
			})
		)
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(imagemin(
			{
				interlaced: true,
				progressive: true,
				optimizationLevel: 3,
				svgoPlugins: [
					{
						removeViewBox: false
					}
				]
			}
		))
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream())
}


// function sprite() {
// 	return src(source_folder + '/img/sprite/*.svg')
// 		.pipe(
// 			svgSprite({
// 				mode: {
// 					stack: {
// 						sprite: "svg-sprite.svg",
// 						example: true
// 					}
// 				}
// 			})
// 		)
// 		.pipe(dest(project_folder + '/img/sprite/'))
// }


function fonts() {

	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts))

}


gulp.task('otf2ttf', () => {
	return src([source_folder + '/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(source_folder + '/fonts/'));
	//доделать удаление .otf
});





// довести до ума - сейчас нужно самому править
function fontsStyle(params) {
	//Flamenco-Light.ttf
	let file_content = fs.readFileSync(source_folder + '/scss/base/_fonts.scss');
	if (file_content == '') {
		fs.writeFile(source_folder + '/scss/base/_fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source_folder + '/scss/base/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
}


function cb() {

}

var smartgrid = require('smart-grid');

/* It's principal settings in smart grid project */
var settings = {
	outputStyle: 'scss', /* less || scss || sass || styl */
	columns: 12, /* number of grid columns */
	offset: '30px', /* gutter width px || % || rem */
	mobileFirst: true, /* mobileFirst ? 'min-width' : 'max-width' */
	container: {
		maxWidth: '1200px', /* max-width оn very large screen */
		fields: '30px' /* side fields */
	},
	breakPoints: {
		lg: {
			width: '1100px', /* -> @media (max-width: 1100px) */
		},
		md: {
			width: '960px'
		},
		sm: {
			width: '780px',
			fields: '15px' /* set fields only if you want to change container.fields */
		},
		xs: {
			width: '560px'
		}
		/* 
		We can create any quantity of break points.

		some_name: {
			 width: 'Npx',
			 fields: 'N(px|%|rem)',
			 offset: 'N(px|%|rem)'
		}
		*/
	}
};

smartgrid('./src/scss/vendor/', settings);






// let build = gulp.series(clean, gulp.parallel(images, html, js, css, fonts, sprite), fontsStyle);
let build = gulp.series(clean, gulp.parallel(images, html, js, css, fonts), fontsStyle);
let watch = gulp.parallel(build, browserSync, watchFiles);



exports.html = html;
exports.css = css;
exports.js = js;

exports.images = images;
// exports.sprite = sprite;

exports.fonts = fonts;
exports.fontsStyle = fontsStyle;



exports.build = build;
exports.watch = watch;
exports.default = watch;
