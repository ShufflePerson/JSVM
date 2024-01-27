import TInstructions, { AllIntructions } from "./Types/CPU/TInstructions";
import TRegisters, { AllRegisters } from "./Types/CPU/TRegisters";
import crypto from "crypto";


function convertUInt32ToKey(uint32: number) {
    const keyBuffer = Buffer.alloc(32);
    keyBuffer.writeUInt32LE(uint32, 0);
    keyBuffer.copy(keyBuffer, 4, 0, 28); 
    return keyBuffer;
}

const MAX_CYCLES_TIMEOUT: number = 10000;
const SECRET_IV_KEY = "9e1c2dc84cd00ae49e1c2dc84cd00ae4";

class CPU {
    private cursor: number;
    private halt: boolean;
    private totalCycles: number;
    public registers: any = {}
    private MAX_MEMORY_SIZE: number;
    private START_OF_CODE: number;
    private DATA_SECTION: number;
    private STRING_TERMINATOR: number;
    private debugStack: string[];
    private decryptKey: number;
    private isDebug: boolean;
    private EMPTY_NUMBER: number;
    private EMPTY_STRING: string;


    constructor(public bytecode: Uint32Array, private logAll: boolean = true) {
        this.halt = false;
        this.MAX_MEMORY_SIZE = this.bytecode[0];
        this.START_OF_CODE = this.bytecode[1];
        this.DATA_SECTION = this.bytecode[2];
        this.STRING_TERMINATOR = this.bytecode[3];
        this.decryptKey = this.bytecode[4];
        this.isDebug = this.bytecode[5] == 1;
        this.EMPTY_NUMBER = this.bytecode[6];
        this.EMPTY_STRING = String.fromCharCode(this.bytecode[7]);


        this.cursor = this.START_OF_CODE;
        this.totalCycles = 0;
        this.debugStack = [];

        this.handle_Clean();
        this.fetchDecodeExecute();
    }

    public fetchDecodeExecute() {
        while (!this.halt && this.cursor < this.DATA_SECTION) {
            if (this.totalCycles++ >= MAX_CYCLES_TIMEOUT) {
                this.crash("Possible infinity loop detected, exiting.");
                break;
            }
            let opcode = this.bytecode[this.moveToNextCodeByte()];
            switch (opcode) {
                case TInstructions.LoadString:          this.handle_LoadString();           break;
                case TInstructions.Clean:               this.handle_Clean();                break;
                case TInstructions.CallDirectObject:    this.handle_CallDirectObject();     break;
                case TInstructions.LoadNumber:          this.handle_LoadNumber();           break;
                case TInstructions.LoadNumberAbs:       this.handle_LoadNumberAbs();        break;
                case TInstructions.Dec:                 this.handle_Dec();                  break;
                case TInstructions.Inc:                 this.handle_Inc();                  break;
                case TInstructions.Sub:                 this.handle_Sub();                  break;
                case TInstructions.Add:                 this.handle_Add();                  break;
                case TInstructions.Jmp:                 this.handle_Jmp();                  break;
                case TInstructions.JmpIfEqual:          this.handle_JmpIfEqual();           break;
                case TInstructions.JmpIfNotEqual:       this.handle_JmpIfNotEqual();        break;
                case TInstructions.ClearRegister:       this.handle_ClearRegister();        break;
                case TInstructions.Mul:                 this.handle_Mul();                  break;
                case TInstructions.Div:                 this.handle_Div();                  break;
                case TInstructions.CallInternal:        this.handle_CallInternal();         break;
                case TInstructions.ClearParam:          this.handle_ClearParam();           break;
                case TInstructions.PushToParam:         this.handle_PushToParam();          break;
                case TInstructions.__LogRegisters:      this.handle___LogRegisters();       break;

                case 0: break;
                default:
                    this.halt = true;
                    this.crash("No such opcode: " + opcode);
                    break;
            }
        }
    }

    public getEmptyString(): string {
        return this.EMPTY_STRING;
    }

    private decryptData(encryptedData: string): string {
        const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(convertUInt32ToKey(this.decryptKey)), Buffer.from(SECRET_IV_KEY, "hex"));
        let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted;
    }

    private lookupString(address: number): string {
        let builtString = "";
        for (let i = address; i < this.MAX_MEMORY_SIZE; i++) {
            if (this.bytecode[i] == this.STRING_TERMINATOR) break;
            builtString += String.fromCharCode(this.bytecode[i]);
        }

        return this.decryptData(builtString);
    }
    

    private byteToInstruction(byte: number): string {
        for (const instruction of AllIntructions) {
            let byteCode = ((TInstructions as any)[instruction])
            if (byteCode == byte) return instruction;
        }
        return "";
    }

    public getRegister(register: TRegisters) {
        return this.registers[register];
    }

    public setRegister(register: TRegisters, data: any) {
        this.registers[register] = data;
    }



    private crash(message: string, suggestion: string = "") {
        console.error("================CPU CRASH================");
        console.log("Last instructions executed: ")
        console.log(this.debugStack.slice(-5, -1).map((message: string, index: number) => {
            return `${this.debugStack.length + index} : ${message}`
        }).join("\n"))
        
        if (this.debugStack.length > 0)
            console.error(`\x1b[31m${this.debugStack.length + 4} : ${this.debugStack[this.debugStack.length - 1]}\t<<<< ERROR ( ${message} )\x1b[0m`)
        else 
            console.log(message);

        if (suggestion) console.log(`\x1b[32m( ${suggestion} )\x1b[0m`)
        console.error("================CPU CRASH================");

    }
    

    private moveToNextCodeByte(): number {
        if (this.cursor < this.DATA_SECTION)
            return this.cursor++;
        this.crash("Code region ends.");
        return 0;
    }

    private log(...data: any) {
        if (this.logAll) {
            console.log(...data)
        }
    }

    private getAllRegistries(exclude: number[]): any[] {
        let registriesValues: any[] = [];
        const keys = Object.keys(this.registers);

        for (const key of keys) {
            if (!exclude.includes(Number.parseInt(key)) && this.registers[key] != this.EMPTY_NUMBER && this.registers[key] != this.EMPTY_STRING) registriesValues.push(this.registers[key])
        }
        

        return registriesValues;
    }


    private handle_LoadString() {
        const register      = this.bytecode[this.moveToNextCodeByte()];
        const strAddress    = this.bytecode[this.moveToNextCodeByte()];
        this.debugStack.push(`LoadString, ${register}, ${strAddress} ( "${this.lookupString(strAddress)}" )`);
        this.registers[register] = this.lookupString(strAddress);
    }

    private handle_Clean() {
        this.debugStack.push(`Clean`);
        this.log("[CPU] Registries Cleaned")
        this.registers[TRegisters.str1] = this.EMPTY_STRING;
        this.registers[TRegisters.str2] = this.EMPTY_STRING;
        this.registers[TRegisters.str3] = this.EMPTY_STRING;
        this.registers[TRegisters.str4] = this.EMPTY_STRING;
        this.registers[TRegisters.num1] = this.EMPTY_NUMBER;
        this.registers[TRegisters.num2] = this.EMPTY_NUMBER;
        this.registers[TRegisters.num3] = this.EMPTY_NUMBER;
        this.registers[TRegisters.num4] = this.EMPTY_NUMBER;
        this.registers[TRegisters.param] = [];
    }

    private handle_CallDirectObject() {
        this.debugStack.push(`CallDirectObject`);
        if (this.registers[TRegisters.str1] == this.EMPTY_STRING) {
            return this.crash("The #str1 register is empty.");
        }

        let propetyPath = this.registers[TRegisters.str1].split(".");
        let obj: any = global;
        for (const propety of propetyPath) {
            if (obj[propety])
                obj = obj[propety]
            else {
                this.halt = true;
                return this.crash(`The object path of "${propetyPath.join(".")} is not accessible in the current context.`);
            }
        }
        obj(...this.getAllRegistries([TRegisters.str1]));
    }

    private handle_LoadNumber() {
        const register      = this.bytecode[this.moveToNextCodeByte()];
        const number        = this.bytecode[this.moveToNextCodeByte()];
        this.debugStack.push(`LoadNumber, ${register}, ${number}`);

        
        this.registers[register] = number;
    }

    private handle_LoadNumberAbs() {
        const register      = this.bytecode[this.moveToNextCodeByte()];
        const numberAddress = this.bytecode[this.moveToNextCodeByte()];
        const number        = this.bytecode[numberAddress];
        this.debugStack.push(`LoadNumberAbs, ${register}, ${numberAddress}`);
        
        this.registers[register] = number;
    }

    private handle_Dec() {
        const register      = this.bytecode[this.moveToNextCodeByte()];
        this.debugStack.push(`Dec, ${register}`);

        this.registers[register]--;
    }
    private handle_Add() {
        const register      = this.bytecode[this.moveToNextCodeByte()];
        const amount        = this.bytecode[this.moveToNextCodeByte()];
        this.debugStack.push(`Add, ${register}, ${amount}`);

        this.registers[register] += amount;
    }
    private handle_Sub() {
        const register      = this.bytecode[this.moveToNextCodeByte()];
        const amount        = this.bytecode[this.moveToNextCodeByte()];
        this.debugStack.push(`Sub, ${register}, ${amount}`);

        this.registers[register] -= amount;
    }
    private handle_Inc() {
        const register      = this.bytecode[this.moveToNextCodeByte()];
        this.debugStack.push(`Inc, ${register}`);

        this.registers[register]++;
    }
    
    private handle_Jmp() {
        const address: number = this.bytecode[this.moveToNextCodeByte()];
        this.debugStack.push(`JMP, ${address}`);
        this.cursor = address;
    }

    private handle_JmpIfEqual() {
        const address: number = this.bytecode[this.moveToNextCodeByte()];
        const register1: number = this.bytecode[this.moveToNextCodeByte()];
        const register2: number = this.bytecode[this.moveToNextCodeByte()];
        
        if (this.getRegister(register1) === this.getRegister(register2)) 
            this.cursor = address;
    }

    private handle_JmpIfNotEqual() {
        const address: number = this.bytecode[this.moveToNextCodeByte()];
        const register1: number = this.bytecode[this.moveToNextCodeByte()];
        const register2: number = this.bytecode[this.moveToNextCodeByte()];
        
        if (this.getRegister(register1) !== this.getRegister(register2)) 
            this.cursor = address;
    }

    private handle_ClearRegister() {
        const register: TRegisters = this.bytecode[this.moveToNextCodeByte()];

        switch (register) {
            case TRegisters.num1:
            case TRegisters.num2:
            case TRegisters.num3:
            case TRegisters.num4:
                this.setRegister(register, this.EMPTY_STRING);
                break;
            case TRegisters.str1:
            case TRegisters.str2:
            case TRegisters.str3:
            case TRegisters.str4:
                this.setRegister(register, this.EMPTY_STRING);
                break;
            case TRegisters.param:
                this.setRegister(TRegisters.param, []);
                break;
            default:
                this.crash(`The register by the opcode of ${register} is not a valid register.`);
                break;
        }
    }

    private handle_Mul() {
        const register    = this.bytecode[this.moveToNextCodeByte()];
        const amount      = this.bytecode[this.moveToNextCodeByte()];
        this.debugStack.push(`Mul, ${this.getRegister(register)}, ${amount}`);

        this.setRegister(register, this.getRegister(register) * amount);
    }

    private handle_Div() {
        const register    = this.bytecode[this.moveToNextCodeByte()];
        const amount      = this.bytecode[this.moveToNextCodeByte()];
        this.debugStack.push(`Div, ${this.getRegister(register)}, ${amount}`);

        this.setRegister(register, this.getRegister(register) / amount);
    }

    private handle_CallInternal() {
        const register    = this.bytecode[this.moveToNextCodeByte()];
        let propetyPath = this.registers[register].split(".");
        let obj: any = global;
        for (const propety of propetyPath) {
            if (obj[propety])
                obj = obj[propety]
            else {
                this.halt = true;
                return this.crash(`The object path of "${propetyPath.join(".")} is not accessible in the current context.`);
            }
        }
        obj(...this.getRegister(TRegisters.param));
    }
    private handle_ClearParam() {
        this.setRegister(TRegisters.param, []);
    }
    private handle_PushToParam() {
        const register    = this.bytecode[this.moveToNextCodeByte()];
        this.setRegister(TRegisters.param, [...this.getRegister(TRegisters.param), this.getRegister(register)])
    }

    private handle___LogRegisters() {
        if (this.isDebug) {
            console.log("======REGISTERS======")
            const names = AllRegisters;
            for (const name of names) {
                let value = this.getRegister(TRegisters[name as keyof typeof TRegisters]);
                if (value == this.EMPTY_NUMBER)
                    value = "(empty)";
                if (value == this.EMPTY_STRING)
                    value = "(empty)";
                console.log(name, ":", value)
            }
            console.log("======REGISTERS======")
        }
    }
}

export default CPU;