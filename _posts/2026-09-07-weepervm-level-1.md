---
layout: post
title: Speaking the sacred phrase
subtitle: Reversing the WeeperVM crackme without a debugger
categories: [itsec, English, reversing, crackmes]
---

After I revived the blog I said I want to write about the stuff I encounter. So here is the first real one.

On [crackmes.one](https://crackmes.one/) I picked [WeeperVM - Level 1](https://crackmes.one/crackme/67f9bdc38f555589f3530a85) by *Ben_Lolo*. It's rated *very hard* (5.0) and the description promised a lot:

> * Encrypted strings
> * Anti-debug
> * Anti-breakpoint
> * Anti-thread suspension
> * Anti-patch
> * Virtualized code with loops, if/else, and janky functions

A whole VM plus five anti-analysis tricks. Sounded like a nice evening. It was more than one evening.

The goal is simple: give the program the right *sacred phrase* and it lets you in. Everything below was done static, with **radare2**, **objdump** and a bit of **gdb**, plus a small Python model of the VM. No patching, no debugger on the real run, and you will see why.

{% toc %}

## First look

```
$ rabin2 -I WeeperVM--Level_1
arch     x86      bits 64      class ELF64      pic true      stripped true
$ rabin2 -S WeeperVM--Level_1
...
10  0x00010a00  0x119f  0x00010a00  ...  -r-x  .text
14  0x00001f60  0xcd4   0x00011f60  ...  -r--  .weep       <-- custom
20  0x00002f20  0x100   0x00012f20  ...  -rw-  .lotus      <-- custom
21  ----------  ----    0x000130c0  0xa0 -rw-  .bss
```

Two sections that no compiler puts there. Running it:

```
$ ./WeeperVM--Level_1
 /\\\______________/\\\__/\\\...           (a big "WEEPER" ascii banner)
Long time no see, friend.
Let us speak the sacred phrase:
Have you forgotten it :(
```

Whatever I typed, `Have you forgotten it :(`. The imports of interest are already telling a story: `fopen`/`fread`/`fseek`/`ftell` (self-inspection), `pthread_create`/`join`, `syscall`, `time`, `sleep`, `strstr`, `__isoc99_sscanf`, `atoi`. Classic anti-debug plumbing.

`.lotus` begins with a base64 looking alphabet, which is a strong hint that the rest of the file is VM material:

```
$ objdump -s -j .lotus WeeperVM--Level_1
 12f20 41424344 45464748 ...  ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()
 12f60 d4cecc6d 66a4a697 ...  <s-box / tables / key material / message glyphs>
```

So `.lotus` is 256 bytes of data memory and `.weep` is code for some machine. A VM. The description did say so.

## The protections

Before touching the VM I wanted to know what fires when. Short version, there are five things and all of them only hurt you if you run it wrong.

### Encrypted strings

`fcn.10e27` is a repeating XOR, `out[i] = ct[i] ^ key[i % klen]`. The ct and key pointers are inline immediates.

```asm
;-- fcn.10e27 (char *ct, int len, char *key, int klen):
0x00010e45  call calloc(len+1, 1)
0x00010e56  idiv ebp                   ; ecx % klen
0x00010e5b  mov  al, [r13 + rdx]       ; key[i % klen]
0x00010e60  xor  al, [r12 + rcx]       ; ^ ct[i]
0x00010e64  mov  [rsi + rcx], al
```

Recovering every call gives:

```
/proc/self/maps      /proc/self/mem       /proc/self/exe
/proc/self/status    TracerPid:           r-xp     %lx-%lx
"Were my bytes not good enough for you >:("
"How dare you... I worked hard on those threads >:("
"Sumin' ain't right..."         "How 'bout no???"
```

Nothing secret, just hidden from `strings`.

### Anti-debug

`fcn.11133` opens `/proc/self/status`, `strstr` for `TracerPid:`, `atoi` the number behind it. Not zero means a debugger is attached, return non-zero, and a watchdog thread kills the run.

### Anti-patch / anti-breakpoint

`fcn.10fe7` reads `/proc/self/exe` into a buffer and hashes it, then compares against an 8 byte value at the end of the file.

```asm
0x00011029  call fopen("/proc/self/exe","rb")
0x0001108c  call fread(buf, 1, filesize, f)
0x0001109e  mov  ebx, 0x102a           ; h = 0x102a
0x000110b3  imul rbx, rbx, 0x11        ; h = h*0x11 + byte      (djb2-ish)
0x000110bf  add  rbx, rcx
...
0x000110f1  cmp  rbx, r13              ; vs the 8-byte trailer
0x000110f4  sete al
```

`fcn.10af6` does the same again, but parses `/proc/self/maps`, finds the `r-xp` mapping and hashes that address range straight out of `/proc/self/mem`. So a single `0xCC` breakpoint or one patched byte in `.text` changes the hash and it aborts.

### Anti-thread-suspension

`fcn.110ff` is called on *every* VM step and inside `READ`.

```asm
0x00011109  call time(NULL)
0x00011117  mov  rax, [rbp + rdx*8]    ; watchdog struct
0x00011122  sub  rsi, [rax]            ; now - last_heartbeat
0x00011125  cmp  rsi, 2                ; > 2s  -> return non-zero
```

The two watchdog threads (`fcn.1120d`, `fcn.10cba`) just loop `{ heartbeat = time(); sleep(1); re-run the two checks above }`. Freeze a thread in a debugger and that delta blows past 2s.

Add it all up and the answer is boring: don't attach a debugger, don't patch a byte. Reverse the VM on paper and rebuild the check in an emulator, then none of this machinery ever runs. I still single stepped the interpreter itself in **gdb** once to confirm the decode, that part has no checks around it.

## The VM core

`main` (`0x11a9b`) is small once you ignore the watchdog setup. It is a fetch/execute loop over `.weep`, an array of 32 bit words, and a `0` word means halt, which is also the success case.

```asm
;-- main:
0x00011aa0  call fcn.00011266          ; spin up watchdog thread #1  (fcn.1120d)
0x00011aa8  jne  0x11ac0               ; NULL -> "Sumin' ain't right..."
0x00011ac5  call fcn.00010d2e          ; spin up watchdog thread #2  (fcn.10cba)
0x00011ad0  jne  0x11aff               ; NULL -> "How dare you... threads >:("
0x00011b03  mov  qword [0x13050], rax  ; watchdog #1 timestamp slot
0x00011b0e  mov  qword [0x13058], rax  ; watchdog #2 timestamp slot
0x00011b17  call fcn.00010fe7          ; anti-patch: hash live .text vs trailer
0x00011b1e  jne  0x11b36               ; mismatch -> "Were my bytes not good enough >:("
0x00011b3b  mov  edi, 0x13050
0x00011b40  call fcn.000110ff          ; anti-thread-freeze: watchdog timestamp check
0x00011b4d  je   0x11b76               ; ok -> enter the VM
                                       ; --- VM fetch/execute loop ---
0x00011b65  call fcn.00011a28          ; step: execute .weep[PC]
0x00011b6c  jne  0x11af5               ; step returned != 0 -> generic error, exit 1
0x00011b6e  mov  eax, [0x13040]        ; PC
0x00011b74  inc  eax
0x00011b76  mov  [0x13040], eax        ; PC++
0x00011b7e  mov  edi, [rax*4 + 0x11f60]; instr = .weep[PC]
0x00011b87  jne  0x11b65               ; instr != 0 -> keep going
0x00011b89  ... fcn.112e9 / fcn.10dbc  ; stop + join watchdog threads
0x00011b9e  ret                        ; instr == 0 (HALT) -> success
```

The step function `fcn.11a28` decodes one word `W`. Every word is stored xored with a broadcast of its own byte 2:

```asm
0x00011a35  call fcn.000110ff          ; heartbeat check first
0x00011a3f  mov  eax, ebx              ; eax = instruction word W
0x00011a41  shr  eax, 0x10
0x00011a44  movzx eax, al              ; b2 = (W >> 16) & 0xff
0x00011a47  imul eax, eax, 0x1010101   ; b2 * 0x01010101
0x00011a4d  xor  eax, ebx              ; D = W ^ (b2*0x01010101)   -> byte2(D) == 0
0x00011a56  movzx edx, ah              ; Dop = byte1(D)
0x00011a59  shr  ecx, 0x19             ; C  = (D >> 25) & 3
0x00011a5c  shr  esi, 0x1b             ; S  = (D >> 27) & 1
0x00011a5f  movzx r8d, al              ; R8 = byte0(D)
0x00011a69  shr  edi, 0x1c             ; OP = D >> 28
0x00011a6c  jmp  0x119c0
;-- 0x119c0: shuffle regs, then dispatch
0x000119cb  cmp eax, 0xf
0x000119ce  ja  0x11a22                ; OP > 15 -> abort
0x000119d0  jmp qword [rax*8 + 0x11e68]; opcode jump table (16 entries)
```

Byte 2 of `D` is always zero afterwards, so it is a cheap tamper check, flip a code byte and the decode goes wrong. The fields:

| field | bits of D | meaning |
|-------|-----------|---------|
| OP  | 31..28 | opcode (0..15) |
| S   | 27     | dest: `0` = `reg[Dop]`, `1` = `mem[Dop]` |
| C   | 26..25 | src: `0` = `reg[R8]`, `1` = `mem[R8]`, `2` = immediate `R8` |
| Dop | 15..8  | dest operand |
| R8  | 7..0   | src operand |

State is `mem` (the 256 bytes of `.lotus`), a register file at `0x13080` (`reg[i] = dword [0x13080 + i*4]`), the flags byte at `0x13060` and the PC at `0x13040`. Walking the 16 handlers off the jump table at `0x11e68`:

| OP | name | effect |
|----|------|--------|
| 0 | MOV | dst = src |
| 1 | MOVP | `S=0`: `reg[Dop] = mem[src]`  ·  `S=1`: `mem[mem[Dop]] = src` |
| 2 | ADD | dst += src |
| 3 | SUB | dst -= src |
| 4 | MUL | dst *= src |
| 5 | MOD | dst %= src |
| 6 | PRINT | write the low byte of dst, `src` times |
| 7 | READ | read up to `src` bytes of stdin into `mem[Dop]`, stop at `\n` |
| 8 | - | invalid, step returns 1, aborts |
| 9 | CMP | flags: b0 eq, b1 dst>src, b2 dst<src, b6 always 1, b5 "input too long" |
| 10 | JMPC | `if (flags & src): PC = (S ? mem[Dop] : reg[Dop]) - 1` |
| 11..15 | AND OR XOR SHL SHR | dst op= src |

`reg[14]` and `reg[15]` are only ever scratch jump targets, every `MOV r14,#255 ; ADD r14,#k` cluster in the bytecode is just computing a branch address for the next `JMPC`.

## Writing the emulator

With the decode and the handlers known I wrote a disassembler (`weep_dis.py`) and an emulator (`weep_emu.py`). The decode is the whole trick:

```python
OPS = {0:"MOV",1:"MOVI",2:"ADD",3:"SUB",4:"MUL",5:"MOD",6:"PRINT",7:"READ",
       8:"BAD",9:"CMP",10:"JMPC",11:"AND",12:"OR",13:"XOR",14:"SHL",15:"SHR"}

def decode(w):
    b2 = (w >> 16) & 0xFF
    key = (b2 * 0x01010101) & 0xFFFFFFFF
    d = w ^ key
    op  = (d >> 28) & 0xF
    s   = (d >> 27) & 1
    c   = (d >> 25) & 3
    dop = (d >> 8) & 0xFF
    r8  = d & 0xFF
    return op, s, c, dop, r8, d
```

The emulator is just that plus the 16 handlers. `mem` is the raw `.lotus` section, `reg` is 256 zeros, `flags` starts at 0, `pc` indexes the word array:

```python
def run(self, max_steps=5_000_000):
    while self.steps < max_steps:
        w = self.words[self.pc]
        if w == 0:
            return "HALT"
        b2 = (w >> 16) & 0xFF
        d = w ^ ((b2 * 0x01010101) & MASK)
        OP = (d >> 28) & 0xF
        S  = (d >> 27) & 1
        C  = (d >> 25) & 3
        Dop = (d >> 8) & 0xFF
        R8 = d & 0xFF
        self.steps += 1
        jt = self.exec(OP, S, C, Dop, R8)
        if jt is not None:
            self.pc = jt
        else:
            self.pc += 1
    return "MAXSTEPS"

def exec(self, OP, S, C, Dop, R8):
    m, r = self.mem, self.reg
    if OP == 0:    # MOV
        self.dst_set(S, Dop, self.src_val(C, R8))
    elif OP == 1:  # indirect load / store
        v = self.src_val(C, R8)
        if S == 0:
            r[Dop] = m[v & 0xFF]
        else:
            m[m[Dop] & 0xFF] = v & 0xFF
    elif OP == 2:  self.dst_set(S, Dop, self.dst_get(S, Dop) + self.src_val(C, R8))
    elif OP == 3:  self.dst_set(S, Dop, self.dst_get(S, Dop) - self.src_val(C, R8))
    elif OP == 4:  self.dst_set(S, Dop, self.dst_get(S, Dop) * self.src_val(C, R8))
    elif OP == 5:
        s = self.src_val(C, R8)
        self.dst_set(S, Dop, (self.dst_get(S, Dop) % s) if s else 0)
    elif OP == 6:  # PRINT
        ch = (r[Dop] & 0xFF) if S == 0 else m[Dop]
        self.out += bytes([ch]) * self.src_val(C, R8)
    elif OP == 7:  # READ
        n = self.src_val(C, R8)
        i = 0
        while i < n:
            if self.inpos >= len(self.inbuf):
                break
            ch = self.inbuf[self.inpos]; self.inpos += 1
            if ch == 0x0A:
                break
            m[(Dop + i) & 0xFF] = ch
            i += 1
        else:
            # filled all n bytes without a newline: the handler does one more read,
            # only a lone '\n' is accepted, anything else sets the "too long" flag 0x20
            rest = self.inbuf[self.inpos:self.inpos+64]
            self.inpos += len(rest)
            if rest != b"\n":
                self.flags |= 0x20
    elif OP == 8:
        return -1  # invalid -> abort
    elif OP == 9:  # CMP
        dst = (r[Dop] & MASK) if S == 0 else m[Dop]
        src = self.src_val(C, R8)
        base = 0x60 if (self.flags & 0x20) else 0x40
        if dst == src:   self.flags = base | 1
        elif src > dst:  self.flags = base | 4
        else:            self.flags = base | 2
    elif OP == 10:  # JMPC
        mask = self.src_val(C, R8)
        target = (r[Dop] & MASK) if S == 0 else m[Dop]
        if self.flags & mask:
            return target
    elif OP == 11: self.dst_set(S, Dop, self.dst_get(S, Dop) & self.src_val(C, R8))
    elif OP == 12: self.dst_set(S, Dop, self.dst_get(S, Dop) | self.src_val(C, R8))
    elif OP == 13: self.dst_set(S, Dop, self.dst_get(S, Dop) ^ self.src_val(C, R8))
    elif OP == 14: self.dst_set(S, Dop, self.dst_get(S, Dop) << (self.src_val(C, R8) & 31))
    elif OP == 15: self.dst_set(S, Dop, (self.dst_get(S, Dop) & MASK) >> (self.src_val(C, R8) & 31))
    return None
```

The `src_val` / `dst_get` / `dst_set` helpers just fold the `S` and `C` bits:

```python
def src_val(self, C, R8):
    if C == 0: return self.reg[R8] & MASK
    if C == 1: return self.mem[R8]
    if C == 2: return R8

def dst_get(self, S, Dop):
    return (self.reg[Dop] & MASK) if S == 0 else self.rd_dword(Dop)

def dst_set(self, S, Dop, val):
    if S == 0: self.reg[Dop] = val & MASK
    else:      self.wr_dword(Dop, val)
```

Run it with an empty stdin and it prints the same banner and the same intro lines as the real binary, byte for byte. So the model is right.

## The check

The interesting bytecode starts at instruction 358. Disassembled:

```
 358: MOV   reg[4], #32
 359: READ  mem[64], maxlen=reg[4]        ; read the phrase into mem[64..95]
 361: MOV   reg[12], #0
 362: MOV   reg[14], #255                 ; reg[14] = 255 + 135 = 390  (fail target)
 363: ADD   reg[14], #135
 ...
 368: MOV   reg[6], #64
 369: ADD   reg[6], reg[12]
 370: LOAD  reg[5] = mem[reg[6]]          ; c = phrase[i]
 371: CMP   reg[5], mem[62]               ; '('  -> ok
 372: JMPC  PC=reg[14]  if flags & #1
 373: CMP   reg[5], mem[63]               ; ')'  -> ok
 374: JMPC  PC=reg[14]  if flags & #1
 375: CMP   reg[5], mem[254]              ; '_'  -> ok
 376: JMPC  PC=reg[14]  if flags & #1
 377: MOV   reg[2], mem[51]               ; 'z'
 378: SUB   reg[2], reg[5]
 379: CMP   reg[2], #26                   ; 'z'-c < 26  -> 'a'..'z'
 380: JMPC  PC=reg[14]  if flags & #4
 381: MOV   reg[2], mem[25]               ; 'Z'
 382: SUB   reg[2], reg[5]
 383: CMP   reg[2], #26                   ; 'Z'-c < 26  -> 'A'..'Z'
 384: JMPC  PC=reg[14]  if flags & #4
 385: MOV   reg[2], mem[61]               ; '9'
 386: SUB   reg[2], reg[5]
 387: CMP   reg[2], #10                   ; '9'-c < 10  -> '0'..'9'
 388: JMPC  PC=reg[14]  if flags & #4
 389: JMPC  PC=reg[15]  if flags & #64    ; nothing matched -> fail
```

So the whole check is:

1. `READ` up to 32 bytes into `mem[64..95]`. The handler does one more read afterwards and only accepts a lone `\n`, so the phrase has to be *exactly* 32 chars, otherwise the `0x20` ("too long") flag is set.
2. charset loop above: each byte must be `a-z`, `A-Z`, `0-9` or one of `(` `)` `_`.
3. round key init at instruction 398: `mem[192+i] = mem[160+i] ^ mem[176+i]` for `i` in 0..15.

```
 400: MOV   reg[12], #0
 401: MOV   reg[2], #160
 402: ADD   reg[2], reg[12]
 403: LOAD  reg[0] = mem[reg[2]]          ; mem[160+i]
 404: ADD   reg[2], #16
 405: LOAD  reg[1] = mem[reg[2]]          ; mem[176+i]
 406: ADD   reg[2], #16
 407: MOV   mem[240], reg[2]
 408: XOR   reg[0], reg[1]
 409: STORE mem[mem[240]] = reg[0]        ; mem[192+i] = mem[160+i] ^ mem[176+i]
 410: ADD   reg[12], #1
 411: CMP   reg[12], #16
 412: JMPC  PC=reg[14]  if flags & #4
```

4. the cipher (next section).
5. compare `mem[64..95]` byte for byte against 32 constants, read straight off the `CMP #imm` operands:

```
dc 6f 56 c2 d3 4e 50 77 69 b2 4d e9 8f f5 2d 12
2a 95 81 e5 35 db 8a 10 14 ff a7 04 d0 c1 e5 74
```

The `CMP` handler carries the "too long" bit into the flags byte, so a wrong-length input can never reach the win:

```asm
0x0001178b  mov  al, 0x40
0x0001178d  test byte [0x13060], 0x20   ; the "too long" bit
0x00011796  mov  al, 0x60
0x00011798  cmp  esi, ecx               ; esi = dst, ecx = src
0x0001179a  jne  0x117a1
0x0001179c  or   eax, 1                 ; equal   -> b0
0x117a1     or   eax, 2 / or edx, 4     ; dst>src -> b1 ; dst<src -> b2
0x000117ae  mov  byte [0x13060], al
```

Funny detail, the messages are swapped from what you expect. Falling through the whole comparison is the *win* and prints `Welcome home :)`, any mismatch prints `Have you forgotten it :(`. If you only read the strings you get it the wrong way around.

## The cipher

`mem[64:96]` is handled as two independent 16 byte blocks (`mem[64:80]`, `mem[80:96]`). Each block is a byte-wise balanced Feistel: left half `L` is 8 bytes, right half `R` is 8 bytes, 16 iterations, and one iteration is:

```
for r in 0..7:                    # one sub-round per byte of R
    f = F(R[r], iteration, r)
    for k in 0..7:                # scatter the 8 bits of f into L
        j = (r + OFF[k]) % 8      # OFF = [7,6,2,1,5,0,3,4]
        L[j] ^= f & (0x80 >> k)
L, R = R, L                       # half swap
```

then one more half swap after the 16 iterations, and between block 0 and block 1 the 16 byte round key array `mem[192:208]` is rotated left by 7.

The round function `F` (bytecode 418..506) was the janky part:

```python
def Fr(rbyte, rk_xor, test_bit):
    hi, lo = rbyte >> 4, rbyte & 0xF
    if test_bit == 0:                       # path A: S_HI:S_LO
        v = (S_HI[hi] << 4) | S_LO[lo]
    else:                                   # path B: S_LO:S_HI
        v = (S_LO[hi] << 4) | S_HI[lo]
    v ^= rk_xor                             # round key xor, both paths
    return P(v)                             # fixed bit permutation
```

with `test_bit = KEY[(7*it) % 16] & (1 << r)` and `rk_xor = KEY[(7*it + r) % 16]`. `S_HI` and `S_LO` are the high and low nibbles of the 16 byte s-box at `mem[128:144]`, both are permutations of 0..15 so `F` is invertible. `P` is a fixed bit shuffle `{7:4, 6:2, 5:7, 4:3, 3:5, 2:6, 1:0, 0:1}`.

It looks scary but `L` is only ever touched as `L[j] ^= something(R)` and the halves swap every round. That is a textbook Feistel. It does not even matter that `F` is ugly, you never invert `F`, you just replay the rounds backwards.

## Inverting it

`weep_crack.py` lifts the s-box, the bit permutation and the key material out of `.lotus`, reimplements the transform forward (checked bit for bit against the emulator on random inputs), then runs the 16 iterations backwards on the ciphertext, per block, block 1 with the key rotated left by 7. The inverse iteration is almost the same code as the forward one, because `R` is untouched by the sub-rounds so the `F` values are recomputable directly:

```python
def feistel_iter_inv(half_L, half_R, it, key):
    Rh_after, Lh_after = list(half_L), list(half_R)
    Lh, Rh = Lh_after, Rh_after            # undo the swap
    for r in range(8):
        test = key[(7*it) % 16] & (1 << r)
        f = Fr(Rh[r], key[(7*it + r) % 16], test)
        for k in range(8):
            j = (r + OFF[k]) % 8
            Lh[j] ^= (f & (0x80 >> k))
    return Lh, Rh
```

```
$ python3 weep_crack.py
OK   in= b'ABCDEFGHIJKLMNOPQRSTUVWXYZabcd1'
OK   in= b'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1'
OK   in= b'Th3_S3cr3t_Ph4s3_G0es_H3re_(x)1'

required mem[64:96] = 28297633 4e673334 6e63655f 49355f34 6e5f3144 31305435 5f67346d 335f2829
as text            = b'()v3Ng34nce_I5_4n_1D10T5_g4m3_()'
```

All 32 bytes land in `[A-Za-z0-9()_]` on their own, so the charset gate is happy and there is exactly one phrase that works (fixed ciphertext, bijective transform).

## Result

```
$ printf '%s\n' '()v3Ng34nce_I5_4n_1D10T5_g4m3_()' | ./WeeperVM--Level_1
 ...
Let us speak the sacred phrase:
Welcome home :)
```

Read as english it is *"(vengeance is an idiots game)"* in leet. Make of that what you want.

## Conclusion

This was hard, but the good kind of hard. The five protections sound intimidating on the crackme page and they are actually implemented properly, but the moment you decide to work static and rebuild the check offline they all turn into dead weight, none of them ever fires. Most of the time went into the VM decode and into getting the Feistel iteration order exactly right, off by one half swap and nothing matches.

Nice challenge. Thanks Ben_Lolo. Onto Level 2, I guess.
