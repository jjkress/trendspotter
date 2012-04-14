# Trendspotter

> It watches for changes in your style.

Trendspotter is a file watcher specific to watching less styles. Without any options it will assume only the files in the root directory given will need to be rendered. In order to watch for changes in other files (in subdirectories), it parses the files in the root directory. Thus as it is now, it serves only well in one setup, like this:

```
styleRootDir/
	masterStyleOne.less
	masterStyleTwo.less
	helpers/
		helper1.less
		helper2.less
		helper3.less
```

This will result in `masterStyleOne.css` and `masterStyleTwo.css` in `styleRootDir`. As it maps the imports from the master files, only the affected master files will be updated if one of the helpers are updated. E.g. if `helper3.less` is only imported by `masterStyleOne.less`, only `masterStyleOne.less` will be rerendered.

## Installation via Git

Clone the project:

	git clone https://github.com/jjkress/trendspotter.git

Install deps and link it:

	cd trendspotter
	npm install
	npm link

## Installation via NPM:

	Sorry, submission to NPM registry is still TODO

## Usage

You can either execute `trendspotter` from the root directory of your styles, or from anywhere using this:

	trendspotter /path/to/your/style-root/

## Warning

Not yet smoke tested. Might eat pixels.

## Roadmap

The following things are planned:

- Better error handling
- Make behavior configurable for other setups
- Make it installable via npm

## Legal yadda yadda

Copyright (c) 2012 JJ Kress

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.