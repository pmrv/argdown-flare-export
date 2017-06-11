#!/usr/bin/env node

const fs = require("fs");
const argdown = require("argdown-parser");
const flare = require("./FlareExport.js")

const app = new argdown.ArgdownApplication();
app.addPlugin(new argdown.ParserPlugin(), "parse");
app.addPlugin(new argdown.ModelPlugin(), "parse");
app.addPlugin(new argdown.JSONExport(), "parse");
app.addPlugin(new flare.FlareExport(), "process-flare");
var data = app.run("parse",
                   {input: fs.readFileSync("../../veggie_debate.argdown")});
                   //{source: fs.readFileSync(process.argv[2])});

module.exports = {
    app: app,
    data: data
}
