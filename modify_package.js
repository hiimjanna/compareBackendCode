let _fs = require("fs");
let _package = require('./info');
let _path = require("path");

_package["environment"] = process.argv[2];
_package["version"] = process.argv[3];

_fs.writeFile(_path.join(__dirname, "info.json"), JSON.stringify(_package, null, 4), function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});