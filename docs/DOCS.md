64 BIT

## Instructions

### LoadString, #strRegister, "str"
Loads the `str` into the `strRegister` register
Supports Immediate and Absolute values. Absolute values can only be provided via variables.

### LoadNumber, #numRegister, num
Loads the `num` into `#numRegister`
Supports Immediate and Absolute values. Absolute values can only be provided via variables.

### CallDirectObject
Calls a object with the path of `#str1` and passes in values from all other registries

### Inc, #numRegister
Increments the `numRegister` by one

### Dec, #numRegister
Decrements the `numRegister` by one

### Add, #numRegister, amount
Adds to the `numRegister` by `amount`
TODO: Supports Immediate and Absolute values. Absolute values can only be provided via variables.

### Sub, #numRegister, amount
Subtracts at the `numRegister` by `amount`
TODO: Supports Immediate and Absolute values. Absolute values can only be provided via variables.

### Clean
Cleans all registries

### JMP, !Label
Jumps to a !Label

### JmpIfEqual, !Label, #register1, #register2
Jumps to `!Label` if `#register1` is equal to `#register2`


### JmpIfNotEqual, !Label, #register1, #register2
Jumps to `!Label` if `#register1` is not equal to `#register2`

### ClearRegister, #Register
Sets the `#Register` to its default empty value.

## Registers

### Strings
str1
str2

### Numbers
num1
num2