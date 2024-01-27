console.clear();
console.log("==================TESTS==================")
import "./Tests"
console.log("==================TESTS==================")
console.log()
console.log()
console.log()
console.log()

import CPU from "./Cpu";
import Parser from "./Parser";

let parser = new Parser("", "./vm/parameters");
parser.parse();
parser.dumpToFile("./bytecode.txt")

let cpu = new CPU(parser.getByteCode());