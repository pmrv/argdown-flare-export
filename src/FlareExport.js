#!/usr/bin/env node

const argdown = require("argdown-parser");

// takes a node from the original data structure and copies only the needed
// attributes into new node
function make_node(node, type) {
    // TODO: guess type from attributes, uh oh
    let level;
    if (type === "section" && "level" in node) {
        level = node.level;
    }
    return {
        name: node.title,
        children: [],
        // attributes unrelated for d3 vis
        meta: {
            id: node.id,
            type: type,
            level: level
        }
    };
}

// TODO: maybe there should be more logic regarding the size attribute
function make_terminal(node) {
    return {
        name: node.title,
        size: 1,
        meta: {
            text: node.text,
            type: "statement",
        }
    };
}

function add_node(root, child) {
    root.children.push(child);
}

function add_section(root, section) {
    let section_node = make_node(section, "section");
    add_node(root, section_node);
    if (section.children === null || section.children.length === 0) return;

    for (var child of section.children) {
        add_section(section_node, child);
    }
}

function find_section(root, section_id) {
    if (root.meta.id === section_id) return root;
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
            name: "root",
            children: [],
            meta: {
                id: "root",
            }
        };

        // we could also just copy the whole section tree from the original
        // data.json structure, but since this is cheap I'd rather do the clean
        // thing and build it completely new, with only the necessary
        // attributes
        for (let section of data.sections) {
            add_section(data.flare, section);
        }

        for (let arg_name in data.arguments) {
            let arg = data.arguments[arg_name];
            let arg_node = make_node(arg, "argument");

            if (arg.section) {
                let section = find_section(data.flare, arg.section.id);
                // TODO: this should always be true, but I need to think about
                // this more
                if (section !== null) {
                    add_node(section, arg_node);
                }
            } else {
                add_node(data.flare, arg_node);
            }

            for (let rel of arg.pcs) {
                if (rel.role === "premise") {
                    add_node(arg_node, make_terminal(rel));
                }
            }
        }

        for (let statement_name in data.statements) {
            let s = data.statements[statement_name];
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
