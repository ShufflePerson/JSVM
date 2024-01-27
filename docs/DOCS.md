One Byte = 32 Bits 
Unsigned values only.

## Instructions

Immediate - Value is provided directly upfront
Absolute  - A Address to the Value is provided 
Indirect  - A address to a address is provided for the value (Used for Variables by the Compiler)

### LoadString, #strRegister, "str"
Loads the `str` into the `strRegister` register
Supports Immediate and Absolute values.

### LoadNumber, #numRegister, num
Loads the `num` into `#numRegister`
Supports Immediate and Absolute values.

### CallDirectObject
Calls a object with the path of `#str1` and passes in values from all other registries

### Inc, #numRegister
Increments the `numRegister` by one

### Dec, #numRegister
Decrements the `numRegister` by one

### Add, #numRegister, amount
Adds to the `numRegister` by `amount`
TODO: Supports Immediate and Absolute values.

### Sub, #numRegister, amount
Subtracts at the `numRegister` by `amount`
TODO: Supports Immediate and Absolute values.

### Clean
Cleans all registries and sets them to their default zero value

### JMP, !Label
Jumps to a !Label

### JmpIfEqual, !Label, #register1, #register2
Jumps to `!Label` if `#register1` is equal to `#register2`

### JmpIfNotEqual, !Label, #register1, #register2
Jumps to `!Label` if `#register1` is not equal to `#register2`

### ClearRegister, #Register
Sets the `#Register` to its default empty value.

### Mul, #numRegister, amount
Multiplies `#numRegister` by `amount`

### Div, #numRegister, amount
Divides `#numRegister` by `amount`

### CallInternal, #strRegister
Calls a function in the current scope with the `#strRegister` path. 
Passes in the `#param` as parameters.

### ClearParam
Resets `#param` register to its default empty value. 

### PushToParam, #register
Pushes to the `#param` register the ´#register` current value

## Debug Instructions
All debug instructions are removed when compiling in release mode

### __LogRegisters
Logs out all registers to the console


## Registers

### Strings
str1
str2
str3
str4

### Numbers
num1
num2
num3
num4                    

### Parameters
param (array)