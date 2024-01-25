enum TRegisters {
    str1 = 0x02,
    str2 = 0x03,
    str3 = 0x04,
    str4 = 0x05,

    num1 = 0x12,
    num2 = 0x13,
    num3 = 0x14,
    num4 = 0x15,
}

const AllRegisters: string[] = ((myEnum: any): string[] => Object.keys(myEnum).filter(k => typeof myEnum[k] === 'number'))(TRegisters);

export default TRegisters;
export { AllRegisters }