const fs = require("fs");
const crypto = require("crypto");

//9e1c2dc84cd00ae49e1c2dc84cd00ae4

const note = "//DO NOT TOUCH. This line has been patched by randomizer.js";
const CONFIG = {
    IV: crypto.randomBytes(16).toString("hex"),
}

function patchParserFile() {
    const parserPath = "./src/Parser.ts";
    const lines = fs.readFileSync(parserPath, "utf-8").split("\r\n");
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(`const SECRET_IV_KEY = "`)) {
            lines[i] = `const SECRET_IV_KEY = "${CONFIG.IV}"; ${note}`
        }
    }

    fs.writeFileSync(parserPath, lines.join("\r\n"))
}

function patchCPUFile() {
    const parserPath = "./src/Cpu.ts";
    const lines = fs.readFileSync(parserPath, "utf-8").split("\r\n");
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(`const SECRET_IV_KEY = "`)) {
            lines[i] = `const SECRET_IV_KEY = "${CONFIG.IV}"; ${note}`
        }
    }

    fs.writeFileSync(parserPath, lines.join("\r\n"))
}

function patchInstructions() {
    const instructionsPath = "./src/Types/CPU/TInstructions.ts";
    const lines = fs.readFileSync(instructionsPath, "utf-8").split("\r\n");

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("    PADDING_DO_NOT_USE")) {
            lines[i] = `    PADDING_DO_NOT_USE = 0x${crypto.randomBytes(1).toString("hex")}, ${note}`
        }
    }
    
    
    fs.writeFileSync(instructionsPath, lines.join("\r\n"))
}

function patchHeader() {
    const headerPath = ""
}

patchCPUFile();
patchParserFile();
patchInstructions();