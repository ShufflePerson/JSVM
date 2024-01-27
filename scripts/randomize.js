const fs = require("fs");
const crypto = require("crypto");

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
}

  
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
    const headerPath = "./src/Types/CPU/THeader.ts"
    const content = fs.readFileSync(headerPath, "utf-8");
    const lines = content.split("\r\n");
    let enum_values = content.split("{")[1].split("}")[0].split("\r\n").filter((line) => line);
    shuffleArray(enum_values);

    let output = `${lines[0]}\r\n${enum_values.join("\r\n")}\r\n}\r\n${lines[lines.length - 1]}`;
    fs.writeFileSync(headerPath, output)
    
}

patchHeader();
patchCPUFile();
patchParserFile();
patchInstructions();