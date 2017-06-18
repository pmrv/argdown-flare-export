# Argdown Flare Export

Converts the internal JSON representation of the debate to a tree-structure
suitable for visualization as
[here](https://bl.ocks.org/mbostock/4063423#flare.json).

The tree is constructed from the following rules:
1. all (topic) sections are children to the root node
2. arguments are added to the sections they belong to or the root node if they
   don't belong into any category
3. the statements in the debate are the terminal nodes and are added to their
   respective arguments or to the root node if they don't belong to any

## Usage

### Executable
From src/ run `node index.js path/to/argdown path/to/json`,
to read the .argdown file from path/to/argdown and write the resulting tree in
json format to path/to/json.
Both arguments can be omitted or replaced by '-' to use stdin/stdout.

### Plugin
To use just the plugin in a different application, import FlareExport from
src/FlareExport.js and add it to your argdown app. The plugin depends on the
JSONExport plugin from
[argdown-parser](https://github.com/christianvoigt/argdown-parser), so you need
to run it after that one. After it ran, the `data` object has a new attribute
`data.flare` that contains the tree as a JS object, which you can then use in
your application.
