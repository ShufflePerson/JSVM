enum TInstructions {
    PADDING_DO_NOT_USE,
    LoadString,         //3 Bytes
    CallDirectObject,   //1 Byte
    Clean,              //1 Byte
    LoadNumber,         //3 Bytes
    LoadNumberAbs,      //3 Bytes
    Inc,                //2 Bytes
    Dec,                //2 Bytes
    Add,                //3 Bytes
    Sub,                //3 Bytes
    Jmp,                //2 Bytes
    JmpIfEqual,         //4 Bytes
    JmpIfNotEqual,      //4 Bytes
    ClearRegister,      //2 Bytes
    Mul,                //3 Bytes
    Div,                //3 Bytes
}

const AllIntructions: string[] = ((myEnum: any): string[] => Object.keys(myEnum).filter(k => typeof myEnum[k] === 'number'))(TInstructions);

export default TInstructions;
export { AllIntructions }