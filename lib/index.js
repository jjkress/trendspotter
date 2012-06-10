var less = require("less")
	, fs = require("fs")
	, util = require("util")
	, path = require("path")
	, util = require("util")
	, v = require("valentine")


// Internal: The fileMap is a housekeeping structure. It contains a hashmap
//           with filename strings as keys and the associated objects as
//           values.
var fileMap = {}

// Internal: A less parser used for pre-parsing
var parser = new(less.Parser)


// Internal: Contains the global options for the filewatcher
const WATCH_OPTIONS = { persistent: true, interval: 250 }


// Internal: Initializes trendspotter with the files given in the array
//           argument.
//
// watchedFiles - an Array of one or more Strings containing the filenames
//                to be watched
//
// Returns nothing.
var init = function(watchedFiles) {
	// TODO: Check whether each filename indeed points to a file
	v.each(watchedFiles, function(filename) {
		fileMap[filename] = new RootFile(filename)
	})
}


// Internal: Constructor for a RootFile object.
//
// It will create an object with a name property and immediately call the 
// object's update() and track() methods
//
// filename - a String containing the filename of the RootFile
//
// Returns a RootFile object.
function RootFile(filename) {
	this.name = filename
	this.update()
	this.track()
}


// Internal: Handles changes to the RootFile by handling import statements
//           before invoking the render() method.
//
// The update method handles some housekeeping tasks specific to RootFiles 
// which can contain import statements. It parses for the import statements and
// updates the fileMap, therefore ensures changes to the imports are handled.
//
// After dealing with all import statements it calls the render() method on the
// RootFile.
//
// Returns nothing.
RootFile.prototype.update = function () {
	// parsing for import statement with the help of the less parser.
	var root = this
	try {
		parser.parse(fs.readFileSync(root.name).toString(), function(err, tree) {
			if (err) {
				writeError(err)
			}
			// update connections to fileMap
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
		})
	} catch (error) {
		// TODO: Better error handling
		console.error(error)
	}
	// call render on yourself
	this.render()
}


// Internal: Render the 
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
	fs.watchFile(file.name, WATCH_OPTIONS, function(curr, prev) {
		if (curr.mtime > prev.mtime) {
			file.update()
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
	this.name = filename
	this.roots = []
	this.updateRoots(root)
	this.track()
}

LeafFile.prototype.track = function () {
	// track yourself
	// re-parse on change and only call render if there is no parse error
	// call render on your roots on changes
	var file = this
	fs.watchFile(file.name, WATCH_OPTIONS, function(curr, prev) {
		if (curr.mtime > prev.mtime) {
			try {
				parser.parse(fs.readFileSync(file.name).toString(), function(err, tree) {
					if (err) {
						// TODO: Better error handling
						if (!err.filename) {
							err.filename = file.name
						}
						console.error("DIDN'T CALL RENDER ON ROOT(S):")
						writeError(err)
					} else {
						v.each(file.roots, function(root) {
							root.render()
						})
					}
				})
			} catch (error) {
				// TODO: Better error handling
				console.error("Exception: DIDN'T CALL RENDER ON ROOT(S):")
				console.error(error)
			}
		}
	})
}

// Internal: Updates the roots property of a LeafFile to add a new RootFile
//
// root - The RootFile object to be added to the roots property
//
// Returns nothing.
LeafFile.prototype.updateRoots = function(root) {
	if (this.roots.indexOf(root) === -1) {
		this.roots.push(root)
	}
}

var writeError = function(error) {
	console.log(error.message + " in " + error.filename)
	console.log(linePrint(error.line - 1) + ": " + error.extract[0])
	console.log(linePrint(error.line) + ": " + error.extract[1])
	console.log(linePrint(error.line + 1) + ": " + error.extract[2])
}

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