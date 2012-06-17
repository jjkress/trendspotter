var less = require("less")
	, fs = require("fs")
	, util = require("util")
	, path = require("path")
	, util = require("util")
	, exec = require('child_process').exec
	, v = require("valentine")


var fileMap = {}
const WATCH_OPTIONS = { persistent: true, interval: 250 }
const LESSC = path.join(process.env._, '../../lib/node_modules/trendspotter/node_modules/less/bin/lessc')


// Internal: Initializes trendspotter with the files given in the array
//           argument.
//
// watchedFiles - an Array of one or more Strings containing the filenames
//                to be watched
//
// Returns nothing.
var init = function(watchedFiles) {
	v.each(watchedFiles, function(filename) {
		fileMap[filename] = new RootFile(filename)
	})
}

// Internal: Constructor for a RootFile object.
//
// It will create an object with a name property and immediately call the 
// object's update(), render() and track() methods
//
// filename - a String containing the filename of the RootFile
//
// Returns a RootFile object.
function RootFile(filename) {
	console.log("RootFile constructor for " + filename);
	this.name = filename
	this.update()
	this.render()
	this.track()
}

// Internal: Convert the RootFile and save it to a css of the same name
//
// On changes this method will be called to convert the less file into a css.
// It will use the input filename.less and create the output filename.css by
// executing the lessc compiler on filename.less.
// 
// Returns nothing.
RootFile.prototype.render = function() {
	console.log("Calling RootFile.render() for " + this.name)
	var root = this
	var out = root.name.toString().replace(/less/, 'css')
		var cmd = LESSC + ' ' + root.name + ' > ' + out
		exec(cmd, function(error, stdout, stderr) {
			if (error !== null) {
				util.log('Rendering of ' + root.name + ' failed:')
				console.log(stderr);
			} else {
				util.log('Rendering of ' + root.name + ' successful.')
			}
	})
};

// Internal: Handles changes to the RootFile by handling import statements
//           before invoking the render() method.
//
// The update method handles some housekeeping tasks specific to RootFiles 
// which can contain import statements. It parses for the import statements and
// updates the fileMap, therefore ensures changes to the imports are handled.
//
// Returns nothing.
RootFile.prototype.update = function() {
	console.log("Calling RootFile.update() for " + this.name)
	var root = this
	try {
		less.Parser().parse(fs.readFileSync(root.name).toString(), function(err, tree) {
			if (err) {
				writeError(err)
			} else {
				root.clean = true
				v.each(tree.rules, function(item) {
					if (item.path) {
						if (item.path in fileMap) {
							// mapping exists, just update the roots
							fileMap[item.path].updateRoots(root)
						} else {
							// no mapping yet, create object
							var lf = new LeafFile(item.path, root)
							fileMap[item.path] = lf
						}
					}
				})
			}
		})	
	} catch (error) {
		console.log(error)
	}
};

// Internal: Initialize the file watcher on the RootFile to get notified on
//           each change.
//
// The file watcher's callback simply checks whether the modification time has
// changed and calls the file's update method if it has.
//
// Returns nothing.
RootFile.prototype.track = function () {
	console.log("RootFile.track()");
	var file = this
	fs.watchFile(file.name, WATCH_OPTIONS, function(curr, prev) {
		if (curr.mtime > prev.mtime) {
			file.update()
			file.render()
		}
	})
}

// Internal: Constructor for a LeafFile object.
//
// It will create an object with a name property containing the filename and
// a roots property containing an array of RootFiles, so we know on which
// RootFile(s) we have to call render() on when this LeafFile changes.
//
// filename - a String containing the filename of the LeafFile
//
// root - a RootFile object that contained an import statement for this 
//        LeafFile
//
// Returns a LeafFile object.
function LeafFile(filename, root) {
	console.log("LeafFile constructor for " + filename);
	this.name = filename
	this.roots = []
	this.updateRoots(root)
	this.track()
}

// Internal: Initializes the file watcher for the LeafFile, performs some
//           checks and calls render() method on all affected RootFiles.
//
// Currently we perform checks here. Maybe we should factor out this portion.
//
// Returns nothing.
LeafFile.prototype.track = function () {
	console.log("LeafFile.track()");
	var file = this
	fs.watchFile(file.name, WATCH_OPTIONS, function(curr, prev) {
		if (curr.mtime > prev.mtime) {
			v.each(file.roots, function(root) {
				root.render()
			})
		}
	})
}

// Internal: Updates the roots property of a LeafFile to add a new RootFile
//
// root - The RootFile object to be added to the roots property
//
// Returns nothing.
LeafFile.prototype.updateRoots = function(root) {
	console.log("LeafFile.updateRoots()");
	if (this.roots.indexOf(root) === -1) {
		this.roots.push(root)
	}
}



// ==================================================================================

// Internal: Display error messages in a more help full way.
// 
// The function should take any error and if it knows about the type, it 
// displays the error information in a way it is helpful and hides unneeded
// information.
// Probably a better way to do this, is by creating error objects which can
// print themselves.
// 
// error - an Object literal containing all error information
//
// Returns nothing.
var writeError = function(error) {
	console.log(error.message + " in " + error.filename)
	console.log(linePrint(error.line - 1) + ": " + error.extract[0])
	console.log(linePrint(error.line) + ": " + error.extract[1])
	console.log(linePrint(error.line + 1) + ": " + error.extract[2])
}

// Internal: Padd the line numbers of parser errors to fill 8 columns so they 
//           are indented and aligned.
//
// line - a Number that should be displayed
//
// Returns an 8 column wide String containing the line number right aligned.
var linePrint = function(line) {
	if (typeof(line) === 'number') {
		line = line.toString()
	}
	var paddingSpaces = Array(8 - line.length).join(" ")
	var prettyLine = paddingSpaces + line
	return prettyLine
}

// Public: Handles the input from the command line and calls the appropriate
// initialization function.
//
// It expects an array of files, which can be empty and will then call a 
// init function to deal with that behavior.
//
// watchedFiles - an Array with zero or more Strings. Each String contains a
//                file name.
//
// Examples
// 
//   exec([])
//
//   exec(['filename.less'])
//
//   exec(['file1.less', 'file2.less'])
//
//   exec(process.argv.slice(2))
// 
// Returns nothing.
module.exports.exec = function (watchedFiles) {
	if (watchedFiles.length === 0) {
		console.info("Watching files via configuration file will come before 1.0")
	} else {
		init(watchedFiles)
	}
}