const fs = require("fs");
const crypto = require("crypto");

//9e1c2dc84cd00ae49e1c2dc84cd00ae4

const CONFIG = {
    IV: crypto.randomBytes(16).toString("hex"),
}

function patchParserFile() {
    const parserPath = "./src/Parser.ts";
    const lines = fs.readFileSync(parserPath, "utf-8").split("\r\n");
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(`const SECRET_IV_KEY = "`)) {
            lines[i] = `const SECRET_IV_KEY = "${CONFIG.IV}";`
        }
    }

    console.log(lines.join("\r\n"))
}

patchParserFile();