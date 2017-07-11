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

### Tests

There are some minimal tests in src/test.js that capture the rules given above.
Run with `npm run test $path_to_argdown`, where `$path_to_argdown` is any
.argdown file.

### Executable
From src/ run `node index.js path/to/argdown path/to/json`,
to read the .argdown file from path/to/argdown and write the resulting tree in
json format to path/to/json.
Both arguments can be omitted or replaced by '-' to use stdin/stdout.

You can use the test visualization in the vis/ directory to check the result.
Drop the output json in the same directory and start a local http server
(`python -m http.server` is an easy one or install the `http-server` npm
module). vis/flare.html shows the whole tree, vis/flare-zoom.html only ever
shows two levels, but you can click on the nodes to zoom around. They were
taken from [here](https://bl.ocks.org/mbostock/4063423) and
[here](https://bl.ocks.org/mbostock/5944371) and slightly modified to log some
debug info to the console.

### Plugin
To use just the plugin in a different application, import FlareExport from
src/FlareExport.js and add it to your argdown app. The plugin depends on the
JSONExport plugin from
[argdown-parser](https://github.com/christianvoigt/argdown-parser), so you need
to run it after that one. After it ran, the `data` object has a new attribute
`data.flare` that contains the tree as a JS object, which you can then use in
your application.

### Flare Tree

The flare data structure is a simple tree, every node has a `name` (given by
the `title` of the original argdown data items), and `children`. The terminal
nodes have a `size` instead of `children`. This is set to 1 for now, but it
would be possible to make this a function of the argument structure.
Additionally there a `meta` sub-object that saves the `id`, the `type`
(*statement*, *argument* or *section*), section-type nodes also save their
`level` in the section hierarchy, it's only used internally, though it might
useful somewhere else as well.

In pseudo-code
```
Node:
    name
    children|size
    meta:
        id
        type
        [level]
```
