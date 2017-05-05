var dist = "web/dhtmlx/";
var sources = "./vendor/dhtmlx/suite/sources/";
var skin = "material"; //material, skyblue, web, terrace

var components = {
		"common":       true,
		"container":    false,//dependencies: accordion, layout, tabbar, sidebar, carousel, windows
		"core":         true,
		"calendar":     true,
		"combo":        false,
		"colorpicker":  false,
		"slider":       false,
		"popup":        false,
		"menu":         false,
		"ribbon":       false,
		"toolbar":      false,
		"editor":       false,
		"chart":        false,
		"dataview":     false,
		"list":         false,
		"tree":         false,
		"treeview":     false,
		"grid":         true,
		"treegrid":     true,
		"form":         false,
		"accordion":    false,
		"layout":       false,
		"tabbar":       false,
		"sidebar":      false,
		"carousel":     false,
		"windows":      false,
		"message":      false,
		"datastore":    false,
		"dataprocessor":false,
		"connector":    true
};

var gulp = require("gulp");
var merge = require("merge-stream");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var header = require("gulp-header");
var clean = require("gulp-clean-css");
var clone = require("gulp-clone");
var rename = require("gulp-rename");
var replace = require("gulp-replace");
var del = require("del");

var config = require("./compiler.json");


gulp.task("dhtmlx-clean", function(){
	return del([
		dist + 'ext',
		dist + 'imgs',
		dist + 'thirdparty',
		dist + '*.*',
	], { force: true });
})
gulp.task("dhtmlx-compile", ["dhtmlx-clean"], function(){

	//var parts = extend(components, config);
	var parts = components;

	var s_files   = files(config.static, parts)
	var s_images  = images(config.folders, parts);

	var s_jsfile  = jsfiles(config.js, parts)
					.pipe(concat(config.name+".sources.js"))

	var c_jsfile  = s_jsfile
					.pipe(clone())
					.pipe(uglify())
					.pipe(rename(config.name+".js"))
					.pipe(header(config.header));

	var s_cssfile = cssfiles(config.folders, parts)
					.pipe(concat(config.name+".css"))
					.pipe(replace("../imgs","./dhtmlx/imgs"))
					.pipe(clean({
						compatibility: "ie7"
  					}))
					.pipe(header(config.header));

	return merge(s_files, s_images, s_jsfile, c_jsfile, s_cssfile).pipe(gulp.dest(dist));

	
});


function extend(components, config){
	var key = {};
	for (var a in components){
		key[a] = true;
		var depends = config.depends[a];
		if (depends){
			for (var j=0; j<depends.length; j++)
				key[depends[j]] = true;
		}
	}

	return key;
}

function files(src, cfg){
	var out = [];
	for (var i=0; i<src.length; i++)
		if (cfg[src[i].component])
			out.push(gulp.src(sources+src[i].file, { base: src[i].base }));

	return merge.apply(this, out);
}

function images(src, cfg){
	var out = [];
	for (var i=0; i<src.length; i++){
		if (cfg[src[i].component]){
			var path = src[i].file+"/codebase/imgs/dhx"+(src[i].imgs || src[i].component)+"_"+skin+"/**";
			out.push(gulp.src(sources+path, { base: sources+src[i].file+"/codebase" }));
			//console.log(sources+path, { base: sources+src[i].file+"/codebase" });
		}
	}

	return merge.apply(this, out);
}

function jsfiles(src, cfg){
	var out = [];
	for (var i=0; i<src.length; i++){
		if (cfg[src[i].component]){
			out.push(sources+src[i].file);
		}
	}
	return gulp.src(out);
}

function cssfiles(src, cfg){
	var out = [];
	for (var i=0; i<src.length; i++){
		if (cfg[src[i].component]){
			if (skin != "material")
				skin = "dhx_"+skin;
			out.push(sources+src[i].file+"/codebase/skins/dhtmlx"+src[i].component+"_"+skin+".css");
		}
	}

	return gulp.src(out);
}
