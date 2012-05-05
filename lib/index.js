var less = require("less")
	, fs = require("fs")
	, path = require("path")
	, util = require("util")
	, v = require("valentine")

// the filemap contains all render dependencies
// keys are the filename, values are the fileObject or a list of fileObjects
var fileMap = {}
	,	watchOptions = { persistent: true, interval: 250 }

var init = function(rootPath) {
	// look for LESS files in rootPath and create RootFile for each
	fs.readdir(rootPath, function(err, filenames) {
		v.each(filenames, function(filename) {
			if (path.extname(filename) === '.less') {
				fileMap[filename] = new RootFile(filename)
			}
		})
	})
}

// Constructor for a rootFile object
function RootFile(filename) {
	this.name = filename
	this.update()
	this.track()
}

RootFile.prototype.update = function () {
	// parse for imports
	var root = this
	var parser = new(less.Parser)
	try {
		parser.parse(fs.readFileSync(root.name).toString(), function(err, tree) {
			if (err) {
				console.error(err)
			}
			// update connections to fileMap
			v.each(tree.rules, function(item) {
				if (item.path) {
					if (item.path in fileMap) {
						// mapping exists, just update the roots
						fileMap[item.path].updateRoots(root)
					} else {
						// no mapping yet, create object
						var lf = new LeafFile(item.path)
						lf.updateRoots(root)
						fileMap[item.path] = lf
					}
				}
			})
		})
	} catch (error) {
		console.error(error)
	}
	// call render on yourself
	this.render()
}

RootFile.prototype.render = function () {
	util.log("Calling render on " + this.name)
	var root = this
	var out = root.name.toString().replace(/less/, 'css')
	try {
		less.render(fs.readFileSync(root.name).toString(), function(err, css) {
			if (err) {
				console.error(err)
			} else {
				fs.writeFileSync(out, css)
			}
		})
	} catch (error) {
		console.error(error)
	}
}

RootFile.prototype.track = function () {
	// tracking yourself
	// call update on yourself on changes
	var file = this
	fs.watchFile(file.name, watchOptions, function(curr, prev) {
		if (curr.mtime > prev.mtime) {
			file.update()
		}
	})
}

// constructor for leafFile object
function LeafFile(filename) {
	this.name = filename
	this.roots = []
	this.track()
}

LeafFile.prototype.track = function () {
	// track yourself
	// call render on your roots on changes
	var file = this
	fs.watchFile(file.name, watchOptions, function(curr, prev) {
		if (curr.mtime > prev.mtime) {
			v.each(file.roots, function(root) {
				root.render()
			})
		}
	})
}

LeafFile.prototype.updateRoots = function(root) {
	if (this.roots.indexOf(root) === -1) {
		this.roots.push(root)
	}
}


module.exports.exec = function (watchPath) {
	if (watchPath.length === 0) {
		console.info("no path to watch given. will use ./")
		init(".")
	} else if (watchPath.length === 1) {
		console.info("watching " + watchPath[0])
		init(watchPath[0])
	} else {
		console.error("Sorry, currently you can only watch one path at once.")
	}
}