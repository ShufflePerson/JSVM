import CPU from "./Cpu";
import Parser from "./Parser";
import TRegisters from "./Types/CPU/TRegisters";

function testPassed(data: string) {
    console.log('\x1b[32m%s\x1b[0m', data);  
}

function testFailed(data: string) {
    console.log('\x1b[31m%s\x1b[0m', data);  
}

function checkRegister(cpu: CPU, cpuName: string, registerName: string, register: TRegisters, expectedValue: string | number) {
    if (cpu.getRegister(register) == expectedValue) {
        testPassed(`[${cpuName}] [${registerName}] [✓]`)
    } else {
        testFailed(`[${cpuName}] [${registerName}] [X] Expected: "${expectedValue}" but got "${cpu.getRegister(register)}"`)
        cpu.crash("Test Failed")
    }
}

function createParseDump(name: string): Parser {
    let parser = new Parser("", "./vm/" + name);
    parser.parse();
    parser.dumpToFile("./dumps/vm_" + name + ".dump")
    return parser
}

let load_str_parse = createParseDump("load_str");
let load_num_parse = createParseDump("load_num");
let variables_parse = createParseDump("variables");
let math_parse = createParseDump("math");
let simple_jump_parse = createParseDump("simple_jump");
let cond_jumps_parse = createParseDump("cond_jumps");


console.log("\n       =========VM OUTPUTS=========\n")
let strCPU          = new CPU(load_str_parse.getByteCode(), false);
let numCPU          = new CPU(load_num_parse.getByteCode(), false);
let variablesCPU    = new CPU(variables_parse.getByteCode(), false);
let mathCPU         = new CPU(math_parse.getByteCode(), false);
let simpleJumpCPU   = new CPU(simple_jump_parse.getByteCode(), false);
let condJumpsCPU    = new CPU(cond_jumps_parse.getByteCode(), false);

console.log("\n       =========VM OUTPUTS=========\n")
    



checkRegister(strCPU, "strCPU", "str1", TRegisters.str1, "console.log");
checkRegister(strCPU, "strCPU", "str2", TRegisters.str2, "Hello World!");
checkRegister(strCPU, "strCPU", "str3", TRegisters.str3, "I am a str3");

checkRegister(numCPU, "numCPU", "num1", TRegisters.num1, 69);
checkRegister(numCPU, "numCPU", "num2", TRegisters.num2, 420);
checkRegister(numCPU, "numCPU", "num3", TRegisters.num3, 1337);

checkRegister(mathCPU, "mathCPU", "num1", TRegisters.num1, 2);
checkRegister(mathCPU, "mathCPU", "num2", TRegisters.num2, 8);
checkRegister(mathCPU, "mathCPU", "num3", TRegisters.num3, 15);
checkRegister(mathCPU, "mathCPU", "num4", TRegisters.num4, 5);


/*
checkRegister(variablesCPU, "variablesCPU", "num1", TRegisters.num1, 1337);
checkRegister(variablesCPU, "variablesCPU", "str1", TRegisters.str1, "console.debug");
checkRegister(variablesCPU, "variablesCPU", "str3", TRegisters.str2, "Hello World. I am a very long variable with a lot of text haha hello");
*/


checkRegister(simpleJumpCPU, "simpleJumpCPU", "str1", TRegisters.str1, "console.debug");
checkRegister(simpleJumpCPU, "simpleJumpCPU", "str2", TRegisters.str2, "I got loaded after the Jmp");
checkRegister(simpleJumpCPU, "simpleJumpCPU", "str3", TRegisters.str3, simpleJumpCPU.getEmptyString());

checkRegister(condJumpsCPU, "simpleJumpCPU", "str1", TRegisters.str1, "console.debug");
checkRegister(condJumpsCPU, "simpleJumpCPU", "num1", TRegisters.num1, 10);
checkRegister(condJumpsCPU, "simpleJumpCPU", "num2", TRegisters.num1, 10);
