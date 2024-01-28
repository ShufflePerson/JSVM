enum TInstructions {
    PADDING_DO_NOT_USE = 0x5d0d4042, //DO NOT TOUCH. This line has been patched by randomizer.js
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
    CallInternal,       //2 Bytes
    ClearParam,         //1 Byte
    PushToParam,        //2 Bytes
    LoadStringInd,      //3 Bytes
    LoadNumberInd,      //3 Bytes
    PushToParamInd,     //2 Bytes
    PushToParamIndStr,  //2 Bytes
    UpdateVariable,     //3 Bytes
    UpdateVariableStr,  //3 Bytes
    DecInd,             //2 Bytes
    IncInd,             //2 Bytes
    MulInd,             //3 Bytes
    DivInd,             //3 Bytes

    //Debug
    __LogRegisters,     //1 Byte
}

const AllIntructions: string[] = ((myEnum: any): string[] => Object.keys(myEnum).filter(k => typeof myEnum[k] === 'number'))(TInstructions);

export default TInstructions;
export { AllIntructions }