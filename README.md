# Trendspotter

> It watches for changes in your style.

Trendspotter is a file watcher specific to watching less styles. It should be easy to integrate into various development environments that do not support handling less css natively.

You have three ways to invoke `trendspotter`, but you will always do so in the directory of your root less files:

- `trendspotter`: without argument it will look for a configuration named `.spotter.json` and will execute on the root files given in there. If there is no such file, it will exit with an error.
- `trendspotter rootFile.less`: this will explicitly watch `rootFile.less` and its imports.
- `trendspotter root1.less root2.less ...`: this will watch multiple root files at once and create separate spotter mappings for each (a spotter mapping maps imports to their root files).

*NOTE*

As of now, the directory layout for your css/less *MUST* be flat. Thus all your imports must be in the same directory as the root files and must not be in a subdirectory. Due to the way the `less` library currently works, it is not able to handle parse errors in imports if those are in a subdirectory. This will be fixed eventually and we will release an update to trendspotter. Until then, you can organize your less files by using a package dot notation:

```
// Example file organization using dot notation

bootstrap.mixins.less        // Files from Twitter bootstrap prefixed with bootstrap.
bootstrap.variable.less
bootstrap.reset.less
package.subpackage.widget.less
package.widget.less
style.less                   // This would be our root file
```

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

As of now, you should execute `trendspotter` from within the directory of your files:

```
$ pwd
~/Projects/awesome/assets/css
$ trendspotter [file1.less files2.less ...]
```

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