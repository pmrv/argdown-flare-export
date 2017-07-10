#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const argdown = require("argdown-parser");
const flare = require("./FlareExport.js")

// for convenience we include the current node and its parent
function traverseTree(parent, tree, userData, cb) {
    userData = cb(parent, tree, userData);
    if (! ("children" in tree) ) return userData;

    for (let ch of tree.children) {
        userData = traverseTree(tree, ch, userData, cb);
    }
    return userData;
}

// so we can fold test functions over data.flare for the test runner
function testFoldTree(tree, type, cb) {
    return traverseTree(undefined, tree, true, (parent, node, passed) => {
        // ignore nodes of the wrong type, propagate other test
        if (type !== "any" && node.meta.type !== type) return passed;
        // if the test failed at another node, propagate that
        if (passed === false) return false;
        return cb(parent, node);
    });
}

// find section with the given id in the data.section tree
function findSection(tree, id) {
    if (tree.id == id) return tree;
    if (! ("children" in tree)) return undefined;

    for (let ch of tree.children) {
        let sec = findSection(ch, id);
        if (sec !== undefined) return sec;
    }
}

if (process.argv.length < 3 || process.argv[2] === '-') {
    var input = process.stdin;
    input.setEncoding("utf8");
} else {
    var input = fs.createReadStream(process.argv[2], {encoding: "utf8"});
}

// in practice there only seems to be one chunk coming in when piping in a
// file, but I don't understand Node well enough to push my luck.
var input_chunks = [];
input.on('data', (ch) => input_chunks.push(ch));
input.on('end', () => {
    let input = input_chunks.join();
    let app = new argdown.ArgdownApplication();

    app.addPlugin(new argdown.ParserPlugin(), "parse");
    app.addPlugin(new argdown.ModelPlugin(), "build");
    app.addPlugin(new flare.FlareExport(), "process-flare");

    let data = app.run(["parse", "build", "process-flare"],
                        {input: input});

    // all sections should contain at least one child
    assert.ok(testFoldTree(data.flare, "section", (parent, node) => {
        return node.children.length > 0;
    }), "There must be no sections without children.");

    // the structure of the sections should be preserved
    assert.ok(testFoldTree(data.flare, "section", (parent, node) => {
        // wrap data.sections in an object, because findSection expects a tree
        let section = findSection({children: data.sections}, node.meta.id);
        if (section.level === 1) {
            return parent.meta.id === "root";
        } else {
            return parent.meta.id === section.parent.id;
        }
    }), "The structure of the sections should be preserved");

    // all arguments should be in the section they originally belonged to
    assert.ok(testFoldTree(data.flare, "argument", (parent, node) => {
        let arg = data.arguments[node.name];
        if ("section" in arg) {
            return parent.meta.id === arg.section.id;
        } else {
            return parent.meta.id === "root";
        }
    }), "Every argument must be a child of its section or of root if it has no section.")

    // each statement should be a child of every argument it is a premise of o
    // ∀premise of argument: ∃child of argument: child == premise
    assert.ok(testFoldTree(data.flare, "argument", (_, node) => {
        let argument = data.arguments[node.name];
        let premises = argument.pcs.filter(p => p.role === "premise");
        return premises.every(p => {
            let statements = node.children.filter(c => c.meta.type === "statement");
            return statements.some(c => {
                return c.name === p.title;
            });
        });
    }), "Statements must be a child of every argument they are a premise of.");

    // if a statement is not used as a premise it should be part of the section
    // that is first mentioned in the 'members' attribute
    assert.ok(testFoldTree(data.flare, "statement", (parent, node) => {
        let statement = data.statements[node.name];
        // handled above
        if (statement.isUsedAsPremise) return true;

        let member = statement.members[0];
        if ("section" in member) {
            return parent.meta.id === member.section.id;
        } else {
            return parent.meta.id === "root";
        }
    }), "Statements not used as premisses should be in the section first " +
        "listed in their 'members' attribute.");
});
