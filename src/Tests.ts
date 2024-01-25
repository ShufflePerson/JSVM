import CPU from "./Cpu";
import Parser from "./Parser";
import TRegisters from "./Types/CPU/TRegisters";

function testPassed(data: string) {
    console.log('\x1b[32m%s\x1b[0m', data);  
}

function testFailed(data: string) {
    console.log('\x1b[31m%s\x1b[0m', data);  
}

let load_str_parse = new Parser("", "./vm/load_str");
load_str_parse.parse();
load_str_parse.dumpToFile("./dumps/vm_load_str.dump")

let load_num_parse = new Parser("", "./vm/load_num");
load_num_parse.parse();
load_num_parse.dumpToFile("./dumps/vm_load_num.dump")

let variables_parse = new Parser("", "./vm/variables");
variables_parse.parse();
variables_parse.dumpToFile("./dumps/vm_variables.dump")

let math_parse = new Parser("", "./vm/math");
math_parse.parse();
math_parse.dumpToFile("./dumps/vm_math.dump")


console.log("       =========VM OUTPUTS=========")
let strCPU          = new CPU(load_str_parse.getByteCode(), false);
let numCPU          = new CPU(load_num_parse.getByteCode(), false);
let variablesCPU    = new CPU(variables_parse.getByteCode(), false);
let mathCPU         = new CPU(math_parse.getByteCode(), false);
console.log("       =========VM OUTPUTS=========")


if (strCPU.registers[TRegisters.str1] == "console.log")             testPassed("[strCPU]        [✓] STR1 Register Passed");                          else testFailed("[strCPU]         [X] STR1 Register Failed");
if (strCPU.registers[TRegisters.str2] == "Hello World!")            testPassed("[strCPU]        [✓] STR2 Register Passed");                          else testFailed("[strCPU]         [X] STR2 Register Failed");
if (strCPU.registers[TRegisters.str3] == "I am a str3")             testPassed("[strCPU]        [✓] STR3 Register Passed");                          else testFailed("[strCPU]         [X] STR3 Register Failed");
if (numCPU.registers[TRegisters.num1] == 69)                        testPassed("[numCPU]        [✓] NUM1 Register Passed");                          else testFailed("[numCPU]         [X] NUM1 Register Failed");
if (numCPU.registers[TRegisters.num2] == 420)                       testPassed("[numCPU]        [✓] NUM2 Register Passed");                          else testFailed("[numCPU]         [X] NUM2 Register Failed");
if (numCPU.registers[TRegisters.num3] == 1337)                      testPassed("[numCPU]        [✓] NUM3 Register Passed");                          else testFailed("[numCPU]         [X] NUM3 Register Failed");
if (mathCPU.registers[TRegisters.num1] == 2)                        testPassed("[mathCPU]       [✓] NUM1 Register Passed");                          else testFailed("[mathCPU]        [X] NUM1 Register Failed");
if (mathCPU.registers[TRegisters.num2] == 8)                        testPassed("[mathCPU]       [✓] NUM2 Register Passed");                          else testFailed("[mathCPU]        [X] NUM2 Register Failed");
if (mathCPU.registers[TRegisters.num3] == 15)                       testPassed("[mathCPU]       [✓] NUM3 Register Passed");                          else testFailed("[mathCPU]        [X] NUM3 Register Failed");
if (variablesCPU.registers[TRegisters.num1] == 1337)                testPassed("[variablesCPU]  [✓] Variables1 Register Passed");                    else testFailed("[variablesCPU]   [X] Variables1 Register Failed");
if (variablesCPU.registers[TRegisters.str1] == "console.debug")     testPassed("[variablesCPU]  [✓] Variables2 Register Passed");                    else testFailed("[variablesCPU]   [X] Variables2 Register Failed");
if (variablesCPU.registers[TRegisters.str2] == "Hello World. I am a very long variable with a lot of text haha hello") testPassed("[variablesCPU] [✓] Variables3 Register Passed");              else testFailed("[variablesCPU] [X] Variables3 Register Failed");
