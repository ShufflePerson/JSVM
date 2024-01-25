enum TInstructions {
    LoadString          = 0x01,
    CallDirectObject,
    Clean           ,
    LoadNumber      ,
    LoadNumberAbs   ,
    Inc,
    Dec,
    Add,
    Sub,
    JMP
}

const AllIntructions: string[] = ((myEnum: any): string[] => Object.keys(myEnum).filter(k => typeof myEnum[k] === 'number'))(TInstructions);

export default TInstructions;
export { AllIntructions }