## Todos
- Variables
- CLI
- Objects
- Functions




# Docs
One Byte = 32 Bits 

Unsigned values only.

## Variables

Define a variable using the `$` symbol.

Suffix the variable type at the end (Num or Str)

```lua
-- Define our Variables
$HelloWorldStr, Hello World
$SomeNum, 3 
$LoggingPathStr, console.log

-- Load our variables onto the registers
LoadString, #str1, $LoggingPathStr
LoadString, #str2, $LoggingPathStr
Loadnum, #num1, $SomeNum

-- Load our values to the ***Param*** register
PushToParam, #str2
PushToParam, #num1

-- Call `console.log` with the parameters that are in the **Param** register
CallInternal, #str1
-- Output: "Hello World 3"
```

## Loops

```lua
-- Reset all registers to their empty value
Clean

-- **#num1** register will act like a `i`
LoadNumber, #num1, 0

-- **#num2** register will hold our target value
LoadNumber, #num2, 10

-- Loads the *console.debug* path and our message template
LoadString, #str1, console.debug
LoadString, #str2, The index of this loop is %s

-- Define our `Loop` label
!Loop

-- Clear the `#Param` register
ClearParam

-- Push our message template and our `i` onto the `#Param` register
PushToParam, #str2
PushToParam, #num1

-- Call console.debug
CallInternal, #str1

--Increment the `#num1` register
Inc, #num1

-- if `#num1` register is not equal to `#num2` register, go to the `Loop` label
JmpIfNotEqual, !Loop, #num1, #num2
```

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