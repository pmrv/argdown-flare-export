#!/usr/bin/env node

// takes a node from the original data structure and copies only the needed
// attributes into new node
function make_node(node) {
    return {
        id: node.id,
        name: node.title,
        children: []
    };
}

// TODO: maybe there should be more logic regarding the size attribute
function make_terminal(node) {
    return {
        name: node.title,
        size: 1
    };
}

function add_node(root, child) {
    root.children.push(child);
}

function add_section(root, section) {
    add_node(flare_tree, make_node(section));
    if (section.children === null && section.children.length === 0) return;

    for (var child of section.children) {
        add_section(root, child);
    }
}

function find_section(root, section_id) {
    if (root.id === section_id) return root;
    if (! ("children" in root) ) return null;

    for (var child of root.children) {
        var x = find_section(child, section_id);
        if (x !== null) return x;
    }

    return null;
}

class FlareExport {

    constructor() {
        this.name = "FlareExport";
    }

    run(data) {
        data.flare = {
            id: "root",
            name: "root",
            children: []
        };

        // we could also just copy the whole section tree from the original
        // data.json structure, but since this is cheap I'd rather do the clean
        // thing and build it completely new, with only the necessary
        // attributes
        for (let section of data.json.sections) {
            add_section(data.flare, section);
        }

        for (let arg_name in data.json.arguments) {
            let arg = data.json.arguments[arg_name];
            let arg_node = make_node(arg);
            // the same section might appear multiple times in .pcs, so lets
            // just use a set here
            let sections_to_add = new Set();

            for (let rel of arg.pcs) {
                let section_id = rel.section;
                let section = find_section(data.flare, section_id);

                if (section !== null) {
                    sections_to_add.add(section);
                }

                if (rel.role === "premise") {
                    // rel.title refers to the id of the statement
                    add_node(arg_node, make_terminal(rel));
                }
            }

            for (let section of sections_to_add) {
                add_node(section, arg_node);
            }

            if (sections_to_add.length === 0) {
                add_node(data.flare, arg_node);
            }
        }

        for (let statement_name in data.json.statements) {
            s = data.json.statements[statement_name];
            if (s.isUsedAsPremise) continue;

            if (s.members.length > 0 && "section" in s.members[0]) {
                let section = find_section(data.flare, s.members[0].section);
                if (section !== null) {
                    add_node(section, make_terminal(s));
                    continue;
                }
            } else {
                add_node(data.flare, make_terminal(s));
            }
        }

        data.flare.children = data.flare.children.filter(
            s => !("children" in s) || s.children.length > 0
        );

        return data;
    }
}

module.exports = {
    FlareExport: FlareExport
}
