import CPU, { EMPTY_STRING } from "./Cpu";
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


let simple_jump_parse = new Parser("", "./vm/simple_jump");
simple_jump_parse.parse();
simple_jump_parse.dumpToFile("./dumps/vm_simple_jump.dump")


console.log("       =========VM OUTPUTS=========")
let strCPU          = new CPU(load_str_parse.getByteCode(), false);
let numCPU          = new CPU(load_num_parse.getByteCode(), false);
let variablesCPU    = new CPU(variables_parse.getByteCode(), false);
let mathCPU         = new CPU(math_parse.getByteCode(), false);
let simpleJumpCPU   = new CPU(simple_jump_parse.getByteCode(), false);
console.log("       =========VM OUTPUTS=========")


if (strCPU          .getRegister              (TRegisters.str1) == "console.log")             testPassed("[strCPU]        [✓] STR1 Register Passed");                          else testFailed("[strCPU]         [X] STR1 Register Failed");
if (strCPU          .getRegister              (TRegisters.str2) == "Hello World!")            testPassed("[strCPU]        [✓] STR2 Register Passed");                          else testFailed("[strCPU]         [X] STR2 Register Failed");
if (strCPU          .getRegister              (TRegisters.str3) == "I am a str3")             testPassed("[strCPU]        [✓] STR3 Register Passed");                          else testFailed("[strCPU]         [X] STR3 Register Failed");
if (numCPU          .getRegister              (TRegisters.num1) == 69)                        testPassed("[numCPU]        [✓] NUM1 Register Passed");                          else testFailed("[numCPU]         [X] NUM1 Register Failed");
if (numCPU          .getRegister              (TRegisters.num2) == 420)                       testPassed("[numCPU]        [✓] NUM2 Register Passed");                          else testFailed("[numCPU]         [X] NUM2 Register Failed");
if (numCPU          .getRegister              (TRegisters.num3) == 1337)                      testPassed("[numCPU]        [✓] NUM3 Register Passed");                          else testFailed("[numCPU]         [X] NUM3 Register Failed");
if (mathCPU         .getRegister              (TRegisters.num1) == 2)                        testPassed("[mathCPU]       [✓] NUM1 Register Passed");                          else testFailed("[mathCPU]        [X] NUM1 Register Failed");
if (mathCPU         .getRegister              (TRegisters.num2) == 8)                        testPassed("[mathCPU]       [✓] NUM2 Register Passed");                          else testFailed("[mathCPU]        [X] NUM2 Register Failed");
if (mathCPU         .getRegister              (TRegisters.num3) == 15)                       testPassed("[mathCPU]       [✓] NUM3 Register Passed");                          else testFailed("[mathCPU]        [X] NUM3 Register Failed");
if (variablesCPU    .getRegister              (TRegisters.num1) == 1337)                testPassed("[variablesCPU]  [✓] VAR1 Register Passed");                    else testFailed("[variablesCPU]   [X] Variables1 Register Failed");
if (variablesCPU    .getRegister              (TRegisters.str1) == "console.debug")     testPassed("[variablesCPU]  [✓] VAR2 Register Passed");                    else testFailed("[variablesCPU]   [X] Variables2 Register Failed");
if (variablesCPU    .getRegister              (TRegisters.str2) == "Hello World. I am a very long variable with a lot of text haha hello") testPassed("[variablesCPU]  [✓] VAR3 Register Passed");              else testFailed("[variablesCPU] [X] Variables3 Register Failed");
if (simpleJumpCPU   .getRegister              (TRegisters.str1) == "console.debug")     testPassed("[simpleJumpCPU] [✓] STR1 Register Passed");                    else testFailed("[simpleJumpCPU]   [X] Str1 Register Failed");
if (simpleJumpCPU   .getRegister              (TRegisters.str2) == "I got loaded after the Jmp")     testPassed("[simpleJumpCPU] [✓] STR2 Register Passed");                    else testFailed("[simpleJumpCPU]   [X] Str2 Register Failed");
if (simpleJumpCPU   .getRegister              (TRegisters.str3) == EMPTY_STRING)     testPassed("[simpleJumpCPU] [✓] STR3 Register Passed");                    else testFailed("[simpleJumpCPU]   [X] Str3 Register Failed");
