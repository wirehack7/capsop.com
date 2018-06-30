---
layout: post
title:  "Cursing Wallaby's nightmare"
subtitle: "Resolving boot2root Wallaby's nightmare VM"
categories: [itsec,English]
typora-copy-images-to: ipic
---

Long time no post. I was quite busy the last months. Also I started to resolve some machines at [HackTheBox](https://hackthebox.eu), it's quite enjoyable.

Back to topic. *[Wallaby's Nightmare](https://www.vulnhub.com/entry/wallabys-nightmare-v102,176/)* is a boot2root VM which I resolved a while ago, but did not had the time to write about it. As I really enjoyed it to resolve that box I'm writing now. So let's start.

Table of contents

* Will be replaced with the ToC, excluding the "Contents" header
{:toc}

## Hints

There is one hint:

> A tip, anything can be a vector, really think things through here based on how the machine works. Make a wrong move though and some stuff gets moved around and makes the machine more difficult!

# Gaining user access

Gaining access to a user account is mostly the first step. From there we might need privilege escalation to gain root access.

### Phase 1

The best thing to start with is always a port scan on the target (IMHO). Port scan log:

```
root@kali:~# nmap -n -O -A -sV -T5 -p- 192.168.159.129
Starting Nmap 7.70 ( https://nmap.org ) at 2018-06-04 12:07 CEST
Nmap scan report for 192.168.159.129
Host is up (0.00039s latency).
Not shown: 65532 closed ports
PORT     STATE    SERVICE VERSION
22/tcp   open     ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 6e:07:fc:70:20:98:f8:46:e4:8d:2e:ca:39:22:c7:be (RSA)
|   256 99:46:05:e7:c2:ba:ce:06:c4:47:c8:4f:9f:58:4c:86 (ECDSA)
|_  256 4c:87:71:4f:af:1b:7c:35:49:ba:58:26:c1:df:b8:4f (ED25519)
80/tcp   open     http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Wallaby's Server
6667/tcp filtered irc
MAC Address: 00:0C:29:AD:99:81 (VMware)
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE
HOP RTT     ADDRESS
1   0.39 ms 192.168.159.129

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.85 seconds
```

Let's focus on port `:80`. First site is a form to submit a nickname for the CTF. Well, I just entered my nickname to see what happens then. 
