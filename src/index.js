#!/usr/bin/env node

const fs = require("fs");
const argdown = require("argdown-parser");
const flare = require("./FlareExport.js")

if (process.argv.length < 3 || process.argv[2] === '-') {
    var input = process.stdin;
    input.setEncoding("utf8");
} else {
    var input = fs.createReadStream(process.argv[2], {encoding: "utf8"});
}

if (process.argv.length < 4 || process.argv[3] === '-') {
    var output = process.stdout;
} else {
    var output = fs.createWriteStream(process.argv[3]);
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

    output.write(JSON.stringify(data.flare), "utf8");
});
