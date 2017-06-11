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

## TODO

* the main.js doesn't work as a stand-alone application, yet (or at all)
* the plug-in puts the generated tree in the `data.flare` attribute of the data
  objection maintained by the `ArgdownApplication`, but there's currently no
  way to write it back to a file
