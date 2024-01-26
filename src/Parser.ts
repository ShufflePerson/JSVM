import fs from "fs"
import TInstructions, { AllIntructions } from "./Types/CPU/TInstructions";
import TRegisters, { AllRegisters } from "./Types/CPU/TRegisters";
import crypto from "crypto";
import { TLabels } from "./Types/Parser/TLabels";
import { TVariables } from "./Types/Parser/TVariables";
import ICursors from "./Types/Parser/ICursors";
import { closestMatch } from "closest-match";
import { EMPTY_NUMBER } from "./Cpu";


const MAX_MEMORY_SIZE = 1024;
const START_OF_CODE = 10;
const DATA_SECTION = 500;
const STRING_TERMINATOR: number = 0x00;


class Parser {
    private bytecode: Uint32Array;
    private OrgBytecode: Uint32Array;
    private variables: TVariables;
    private labels: TLabels;
    private cursors: ICursors;
    private currentLine: number;
    private abort: boolean;
    private debugStack: string[];

    constructor(private input: string, inputFile: string = "", private parseLabels: boolean = true) {
        this.bytecode = new Uint32Array(MAX_MEMORY_SIZE);

        this.labels = {};
        this.currentLine = 0;
        this.abort = false;
        this.debugStack = [];
        this.cursors = {
            code: START_OF_CODE,
            header: 0,
            data: DATA_SECTION + 1
        }
        this.writeHeader();
        this.variables = {
            "$EmptyNumber": {
                value: this.addNumberToData(EMPTY_NUMBER),
                type: "number"
            }
        };

        if (inputFile != "") {
            if (!fs.existsSync(inputFile)) {
                console.error("Input file was not found.");
                return;
            }
            this.input = fs.readFileSync(inputFile, "utf-8");
        } else if (input == "") {
            console.error("No input was provided.");
        }

    }

    private resetBytecode() {
        this.bytecode = new Uint32Array(MAX_MEMORY_SIZE);
    }

    private writeHeader() {
        this.bytecode[this.cursors.header++] = MAX_MEMORY_SIZE;
        this.bytecode[this.cursors.header++] = START_OF_CODE;
        this.bytecode[this.cursors.header++] = DATA_SECTION;
        this.bytecode[this.cursors.header++] = STRING_TERMINATOR;
    }

    public parse() {
        let lines = this.input.replace(/\r/g, "").split("\n");

        for (const line of lines) {
            if (!line) continue;
            if (this.abort) break;
            const parts = line.split(",").map((part: string) => {
                if (part[0] != " ") return part;
                return part.substring(1);
            });
            const instructionStr = parts[0];

            if (!instructionStr) continue;

            //Handle Variables
            if (this.isVariableName(instructionStr)) {
                this.handle_Variable(parts);
                continue;
            }

            //Ignore label instructions
            if (instructionStr[0] == "!") {
                this.handle_Label(parts);
                continue;
            }

            const args = parts.slice(1);
        
            switch (instructionStr) {
                case "LoadString"           :          this.handle_LoadString               (args);   break;
                case "Clean"                :          this.handle_Clean                    (args);   break;
                case "CallDirectObject"     :          this.handle_CallDirectObject         (args);   break;
                case "LoadNumber"           :          this.handle_LoadNumber               (args);   break;
                case "Inc"                  :          this.handle_Inc                      (args);   break;
                case "Dec"                  :          this.handle_Dec                      (args);   break;
                case "Add"                  :          this.handle_Add                      (args);   break;
                case "Sub"                  :          this.handle_Sub                      (args);   break;
                case "Jmp"                  :          this.handle_Jmp                      (args);   break;
                case "JmpIfEqual"           :          this.handle_JmpIfEqual               (args);   break;
                case "JmpIfNotEqual"        :          this.handle_JmpIfNotEqual            (args);   break;
                case "ClearRegister"        :          this.handle_ClearRegister            (args);   break;

                default:
                    this.crash(`No such instruction: "${instructionStr}"`, `Did you mean ${closestMatch(instructionStr, AllIntructions)}`)
                    break;
            }
            this.currentLine++;
        }

        if (this.parseLabels) {
            console.log("Labels parsed, running the main parse now.");
            this.resetBytecode();
            this.currentLine = 0;
            this.abort = false;
            this.debugStack = [];
            this.cursors = {
                code: START_OF_CODE,
                header: 0,
                data: DATA_SECTION + 1
            }
            this.writeHeader();
            this.parseLabels = false;
            this.parse();
        }
    }
    public getByteCode(): Uint32Array {
        return this.bytecode;
    }

    public dumpToFile(file: string) {
        const buffer = Buffer.from(this.bytecode.buffer);
        const hexString = buffer.toString('hex').match(/.{1,64}/g)?.join('\n') || '';
        fs.writeFileSync(file, hexString, 'utf-8');
    }

    private addStringToData(str: string): number {
        let startAddress = this.cursors.data;
        for (let i = 0; i < str.length; i++) {
            this.bytecode[this.cursors.data++] = str[i].codePointAt(0) || 0;
        }

        this.bytecode[this.cursors.data++] = STRING_TERMINATOR;

        return startAddress;
    }

    private crash(message: string, suggestion: string = "") {
        let lines = this.input.replace(/\r/g, "").split("\n");

        console.error("================PARSING CRASH================");
        console.log(this.debugStack.slice(-5).join("\n") + "\n")
        if (this.currentLine > 0)
            console.error(this.currentLine - 1, ":", lines[this.currentLine - 1])
        console.error(`\x1b[31m${this.currentLine} : ${lines[this.currentLine]}\t<<<< ERROR ( ${message} )\x1b[0m`)
        if (suggestion) {
            console.log(`\x1b[32m( ${suggestion} )\x1b[0m`)
        }
        console.error(this.currentLine + 1, ":", lines[this.currentLine + 1])
        console.error("================PARSING CRASH================");

        this.abort = true;
        process.exit(-1);
    }

    private getLabelAddress(parts: string[]): number {
        this.ensureArguments(parts, ["label"]);
        const [labelName] = parts;
        const label = this.labels[labelName.substring(1)];

        if (!label && !this.parseLabels) {
            let possibleMatch = closestMatch(labelName, Object.keys(this.labels));
            this.crash("Failed to find a label with the name of: " + labelName, possibleMatch ? `Did you mean ${possibleMatch}` : "");
        }

        if (label) {
            return label.address;
        }

        if (!label && this.parseLabels) {
            return 0xFFFFFFFF;
        }

        return 0xFFFFFFFF; 
    }

    private ensureArguments(items: string[], args: string[]) {
        if (args.length <= items.length) return;
        
        const difference: number = args.length - items.length;
        const result: Array<any> = args.slice(-difference);
        this.crash(`Missing the following arguments: ${result.join(", ")}`);
    }

    public addNumberToData(num: number): number {
        let startAddress = this.cursors.data++;
        this.bytecode[startAddress] = num;
        return startAddress;
    }

    private variableNameToHash(name: string): Uint32Array {
        const hash = crypto.createHash('sha1').update(name, 'utf8').digest('hex');
        const firstFourBytes = Buffer.from(hash, 'hex').slice(0, 4);
        return new Uint32Array(firstFourBytes);
    }

    private loadVariableStr(name: string): number {
        const variable = this.variables[name];
        if (!variable) return -1;
        let data = variable.value;
        return data;
    }
    
    private loadVariableNum(name: string): number {
        const variable = this.variables[name];
        if (!variable) {
            this.crash(`The variable ${name} does not (yet) exist.`);
            return -1;
        }
        let data = variable.value;
        return data;
    }

    private isNumber(val: string): boolean {
        let isNumber = /^\d+$/.test(val);
        if (!isNumber) return false;
        let parsed = Number.parseInt(val);
        if (parsed > 0xFFFFFFFF) {
            this.debugStack.push("[isNumber]: Value is higher than 0xFFFFFFFF");
            return false;
        }
        return true;
    }

    private getRegisterFromStr(registerStr: string): number {
        switch (registerStr) {
            case "str1"     : return TRegisters.str1;
            case "str2"     : return TRegisters.str2;
            case "str3"     : return TRegisters.str3;
            case "str4"     : return TRegisters.str4;
            case "num1"     : return TRegisters.num1;
            case "num2"     : return TRegisters.num2;
            case "num3"     : return TRegisters.num3;
            case "num4"     : return TRegisters.num4;
            default         : return 0;
        }
    }

    private isVariableName(name: string): boolean {
        return name[0] == "$";
    }

    private ensureRegisterOrFail(register: string): number {
        if (register[0] != "#") {
            this.crash("You can only load a value into a register", `Did you mean #${register}`);
            return -1;
        }
        register = register.substring(1);
        const registerCode = this.getRegisterFromStr(register);
        if (registerCode == 0) {
            this.crash(`Failed to find a register by the name of: ${register}`, `Did you mean ${closestMatch(register, AllRegisters)}`);
            return -1;
        }

        return registerCode;
    }

    private addDebug(message: string) {
        this.debugStack.push(message);
    }

    private moveToNextCodeByte(): number {
        if (this.cursors.code >= DATA_SECTION) {
            this.crash("Reached the end of code region.");
            return this.cursors.code;
        }
        return this.cursors.code++;
    }

    private handle_LoadString(parts: string[]) {
        this.ensureArguments(parts, ["register", "string"]);
        let [register, str] = parts;

        this.addDebug("LoadString: Attempting to parse the Register parameter");
        const registerCode = this.ensureRegisterOrFail(register);

        this.addDebug("LoadString: Attempting to get the string address");
        const strAddress = this.loadVariableStr(str) == -1 ? this.addStringToData(str) : this.loadVariableStr(str);
        this.bytecode[this.moveToNextCodeByte()] = TInstructions.LoadString;
        this.bytecode[this.moveToNextCodeByte()] = registerCode;
        this.bytecode[this.moveToNextCodeByte()] = strAddress;
    }


    private handle_Clean(parts: string[]) {
        this.bytecode[this.moveToNextCodeByte()] = TInstructions.Clean;
    }

    private handle_CallDirectObject(parts: string[]) {
        this.bytecode[this.moveToNextCodeByte()] = TInstructions.CallDirectObject;
    }

    private handle_LoadNumber(parts: string[]) {
        this.ensureArguments(parts, ["register", "numberOrVariable"]);
        let [register, numberOrVariable] = parts;

        if (this.isVariableName(numberOrVariable)) {
            numberOrVariable = this.loadVariableNum(numberOrVariable).toString();
            this.bytecode[this.moveToNextCodeByte()] = TInstructions.LoadNumberAbs;
        } else {
            if (!this.isNumber(numberOrVariable)) {
                return this.crash("A non integer value was provided for LoadNumber");
            }
            this.bytecode[this.moveToNextCodeByte()] = TInstructions.LoadNumber;
        }


        this.bytecode[this.moveToNextCodeByte()] = this.ensureRegisterOrFail(register);
        this.bytecode[this.moveToNextCodeByte()] = Number.parseInt(numberOrVariable);
    }

    private handle_Variable(parts: string[]) {
        this.ensureArguments(parts, ["variableName", "data"]);
        const [variableName, data] = parts;
        const typeVariable = variableName.substring(variableName.length - 3);

        const existingVar = this.variables[variableName];
        if (existingVar) {
            const existingAddress = existingVar.value;
            if (typeVariable == "Num") {
                this.bytecode[existingAddress] = Number.parseInt(data);
            }
        }
        
        if (typeVariable == "Str") {
            let strAddress = this.addStringToData(data);
            this.variables[variableName] = {
                type: "string",
                value: strAddress
            }
        } else if (typeVariable == "Num") {
            this.variables[variableName] = {
                type: "number",
                value: this.addNumberToData(Number.parseInt(data))
            }
        }
    }

    private handle_Inc(parts: string[]) {
        this.ensureArguments(parts, ["register"]);
        let [ register ] = parts;
        this.bytecode[this.moveToNextCodeByte()] = TInstructions.Inc;
        this.bytecode[this.moveToNextCodeByte()] = this.ensureRegisterOrFail(register);
    }

    private handle_Dec(parts: string[]) {
        this.ensureArguments(parts, ["register"]);
        let [ register ] = parts;
        this.bytecode[this.moveToNextCodeByte()] = TInstructions.Dec;
        this.bytecode[this.moveToNextCodeByte()] = this.ensureRegisterOrFail(register);
    }

    private handle_Add(parts: string[]) {
        this.ensureArguments(parts, ["register", "amount"]);
        let [register, amount] = parts;
 
        this.bytecode[this.moveToNextCodeByte()] = TInstructions.Add;
        this.bytecode[this.moveToNextCodeByte()] = this.ensureRegisterOrFail(register);
        this.bytecode[this.moveToNextCodeByte()] = Number.parseInt(amount);
    }

    private handle_Sub(parts: string[]) {
        this.ensureArguments(parts, ["register", "amount"]);
        let [register, amount] = parts;
  
        this.bytecode[this.moveToNextCodeByte()] = TInstructions.Sub;
        this.bytecode[this.moveToNextCodeByte()] = this.ensureRegisterOrFail(register);
        this.bytecode[this.moveToNextCodeByte()] = Number.parseInt(amount);
    }

    private handle_Label(parts: string[]) {
        this.ensureArguments(parts, ["label"]);
        const labelName = parts[0].substring(1);
        this.labels[labelName] = {
            address: this.cursors.code
        };
    }


    private handle_Jmp(parts: string[]) {
        this.bytecode[this.moveToNextCodeByte()] = TInstructions.Jmp;
        this.bytecode[this.moveToNextCodeByte()] = this.getLabelAddress(parts);

    }

    private handle_JmpIfEqual(parts: string[]) {
        this.ensureArguments(parts, ["label", "register", "register"]);
        const [label, register1Name, register2Name] = parts;
        const labelAddress = this.getLabelAddress(parts);
        const register1 = this.ensureRegisterOrFail(register1Name)
        const register2 = this.ensureRegisterOrFail(register2Name)

        this.bytecode[this.moveToNextCodeByte()] = TInstructions.JmpIfEqual;
        this.bytecode[this.moveToNextCodeByte()] = labelAddress;
        this.bytecode[this.moveToNextCodeByte()] = register1;
        this.bytecode[this.moveToNextCodeByte()] = register2;
    }

    private handle_JmpIfNotEqual(parts: string[]) {
        this.ensureArguments(parts, ["label", "register", "register"]);
        const [label, register1Name, register2Name] = parts;
        const labelAddress = this.getLabelAddress(parts);
        const register1 = this.ensureRegisterOrFail(register1Name)
        const register2 = this.ensureRegisterOrFail(register2Name)

        this.bytecode[this.moveToNextCodeByte()] = TInstructions.JmpIfNotEqual;
        this.bytecode[this.moveToNextCodeByte()] = labelAddress;
        this.bytecode[this.moveToNextCodeByte()] = register1;
        this.bytecode[this.moveToNextCodeByte()] = register2;
    }

    private handle_ClearRegister(parts: string[]) {
        this.ensureArguments(parts, ["register"]);
        const [registerName] = parts;
        const register = this.ensureRegisterOrFail(registerName);

        this.bytecode[this.moveToNextCodeByte()] = TInstructions.ClearRegister;
        this.bytecode[this.moveToNextCodeByte()] = register;
    }
}

export default Parser;