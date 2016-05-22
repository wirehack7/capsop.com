---
layout: 		post
title:  		"Acid Reloaded hacking"
subtitle: 		"Fun with the vulnerable OS Acid Reloaded"
date:			2016-05-22 19:28:17 
categories: 	["itsec","tools"]
---

We know that there are many ways to gain access to a server out there. We can use several known exploits, unknown 0days and even social engineer to access. These activities are also all depending on training. A good way to train are *Capture the Flag* events and vulnerable systems which are made to be vulnerable. As CTF events are mostly event and time based I'm focusing on the second way, using vulnerable systems. A good place to gain some is VulnOS, the systems are served there as virtual machines. So it's easy to embed them.

I will focus in this post on the vulnerable machine **Acid Reloaded**, as it was really fun to solve it.

![](https://i.imgur.com/WR44iSE.png)

Table of contents:
* Will be replaced with the ToC, excluding the "Contents" header
{:toc}

## Setting it up

Setting it up is fairly easy. Just download it (best way is via Torrent as the bandwidth is limited for the website). Unzip it and you have a folder with **VMWare** virtual disks. You can easily embed them in **VMWare Workstation** or **Oracle Virtual Box**. I converted the disk to a proper *Virtual Box* format. For that, create a new VM with Linux settings, then go to the mediums manager and convert it to *.vdi*, I also marked it there then as read only, so no changes will be saved and I am able to shoot it up. Also I put it into an internal network of Virtual Box, with a slim Debian server which is acting as DHCP and DNS server.
For the pentesting purpose I'll use Kali Linux.

## Gather information

First thing to do is get down which IP the VM uses. Yes we can simple look at the DHCP server, but why... :wink:

	root@kali:~# nmap -sP 192.168.1.0/24

	Starting Nmap 7.12 ( https://nmap.org ) at 2016-05-22 20:12 CEST
	Nmap scan report for 192.168.1.100
	Host is up (0.00063s latency).
	MAC Address: 08:00:27:97:4A:32 (Oracle VirtualBox virtual NIC)
	Nmap scan report for 192.168.1.254
	Host is up (0.00051s latency).
	MAC Address: 08:00:27:69:BC:A0 (Oracle VirtualBox virtual NIC)
	Nmap scan report for 192.168.1.1
	Host is up.
	Nmap done: 256 IP addresses (3 hosts up) scanned in 5.36 seconds

Okay, the VM uses ```192.168.1.100``` as it's IP. Let's scan it:

	root@kali:~# nmap -sS -sV 192.168.1.100
	
	Starting Nmap 7.12 ( https://nmap.org ) at 2016-05-22 20:14 CEST
	Nmap scan report for 192.168.1.100
	Host is up (0.00036s latency).
	Not shown: 999 closed ports
	PORT   STATE SERVICE VERSION
	22/tcp open  ssh     OpenSSH 6.7p1 Ubuntu 5ubuntu1.3 (Ubuntu Linux; protocol 2.0)
	MAC Address: 08:00:27:97:4A:32 (Oracle VirtualBox virtual NIC)
	Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	Nmap done: 1 IP address (1 host up) scanned in 1.62 seconds

Port ```:22``` is open with listening SSH on it, time to connect to it:

	root@kali:~# ssh root@192.168.1.100
	    _    ____ ___ ____        ____  _____ _     ___    _    ____  _____ ____  
	   / \  / ___|_ _|  _ \      |  _ \| ____| |   / _ \  / \  |  _ \| ____|  _ \ 
	  / _ \| |    | || | | |_____| |_) |  _| | |  | | | |/ _ \ | | | |  _| | | | |
	 / ___ \ |___ | || |_| |_____|  _ <| |___| |__| |_| / ___ \| |_| | |___| |_| |
	/_/   \_\____|___|____/      |_| \_\_____|_____\___/_/   \_\____/|_____|____/ 
	
																			-by Acid
	
	Wanna Knock me out ??? 
	3.2.1 Let's Start the Game.
	                                                                              
	root@192.168.1.100's password: 
	Permission denied, please try again.
	root@192.168.1.100's password: 

Hrmm, okay. So we have a SSH server here with a nice ASCII art banner. And a login. Shall we bruteforce? Shall we exploit? Nah, I think there has to be some other way. So let's scan it again, this time deeper, with all ports.

	root@kali:~# nmap -p1-65535 -sV -T4 192.168.1.100

	Starting Nmap 7.12 ( https://nmap.org ) at 2016-05-22 20:28 CEST
	Nmap scan report for 192.168.1.100
	Host is up (0.00022s latency).
	Not shown: 65533 closed ports
	PORT      STATE    SERVICE VERSION
	22/tcp    open     ssh     OpenSSH 6.7p1 Ubuntu 5ubuntu1.3 (Ubuntu Linux; protocol 2.0)
	33447/tcp filtered unknown
	MAC Address: 08:00:27:97:4A:32 (Oracle VirtualBox virtual NIC)
	Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	Nmap done: 1 IP address (1 host up) scanned in 3.81 seconds

Okay, we have another port, ```33447```. It's filtered and we cannot reach it. Let's lean back and drink a cup of coffee/tea. Hrmmm.... Do you remember the banner of SSH? There is *Knock* written, with a capital letter. And 3, 2, 1. To start the game. 
Do you know port knocking? It's a way to restrict access to a port. Other ports have to be "triggered", so a firewall (like iptables) adds the own IP to allow rules. And this "3, 2, 1" looks like a sequence. Let's try it:

	root@kali:~# for i in {3..1}; do nmap -Pn --host_timeout 100 --max-retries 0 -p $i 192.168.1.100; done && nmap -p1-65535 -sV -T4 192.168.1.100
	
	Starting Nmap 7.12 ( https://nmap.org ) at 2016-05-22 20:54 CEST
	Nmap scan report for 192.168.1.100
	Host is up (0.00033s latency).
	PORT  STATE  SERVICE
	3/tcp closed compressnet
	MAC Address: 08:00:27:97:4A:32 (Oracle VirtualBox virtual NIC)
	
	Nmap done: 1 IP address (1 host up) scanned in 0.14 seconds
	
	Starting Nmap 7.12 ( https://nmap.org ) at 2016-05-22 20:54 CEST
	Nmap scan report for 192.168.1.100
	Host is up (0.00023s latency).
	PORT  STATE  SERVICE
	2/tcp closed compressnet
	MAC Address: 08:00:27:97:4A:32 (Oracle VirtualBox virtual NIC)
	
	Nmap done: 1 IP address (1 host up) scanned in 0.15 seconds
	
	Starting Nmap 7.12 ( https://nmap.org ) at 2016-05-22 20:54 CEST
	Nmap scan report for 192.168.1.100
	Host is up (0.00023s latency).
	PORT  STATE  SERVICE
	1/tcp closed tcpmux
	MAC Address: 08:00:27:97:4A:32 (Oracle VirtualBox virtual NIC)
	
	Nmap done: 1 IP address (1 host up) scanned in 0.16 seconds
	
	Starting Nmap 7.12 ( https://nmap.org ) at 2016-05-22 20:54 CEST
	Nmap scan report for 192.168.1.100
	Host is up (0.00025s latency).
	Not shown: 65533 closed ports
	PORT      STATE SERVICE VERSION
	22/tcp    open  ssh     OpenSSH 6.7p1 Ubuntu 5ubuntu1.3 (Ubuntu Linux; protocol 2.0)
	33447/tcp open  http    Apache httpd 2.4.10 ((Ubuntu))
	MAC Address: 08:00:27:97:4A:32 (Oracle VirtualBox virtual NIC)
	Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
	
	Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
	Nmap done: 1 IP address (1 host up) scanned in 14.39 seconds

Wow, as we see, the port opened! :tada:
Let's open it in a browser!

![](https://i.imgur.com/D4LjjAO.png)

Okay, we shall use our brain. Well, we are already doing, so we are on a good way I assume. The image is in ```/images/```, but this gives a 403 Forbidden error. We have to keep on that trail and gain more information. to do this we should bruteforce the directory of the webserver. I am using [dirsearch](https://github.com/maurosoria/dirsearch)[^1] here, it's a nice Python based app to scan webservers. 

	root@kali:~/dirsearch# ./dirsearch.py -u "http://192.168.1.100:33447/" -e php,js -x 403
	
	 _|. _ _  _  _  _ _|_    v0.3.6
	(_||| _) (/_(_|| (_| )
	
	Extensions: php, js | Threads: 10 | Wordlist size: 5537
	
	Error Log: /root/dirsearch/logs/errors-16-05-22_21-33-51.log
	
	Target: http://192.168.1.100:33447/
	
	[21:33:51] Starting: 
	[21:33:58] 301 -  321B  - /bin  ->  http://192.168.1.100:33447/bin/
	[21:33:58] 200 -    1KB - /bin/
	[21:33:59] 301 -  321B  - /css  ->  http://192.168.1.100:33447/css/
	[21:34:01] 301 -  322B  - /html  ->  http://192.168.1.100:33447/html/
	[21:34:01] 301 -  324B  - /images  ->  http://192.168.1.100:33447/images/
	[21:34:01] 200 -  682B  - /index.html
	
	Task Completed

Okay, so we have 3 more directories there, let's get to ```/bin```.

![](https://i.imgur.com/FFXymlZ.png)

Interesting, a login form. Shall we penetrate it? But wait, lets use another program to dig into the directories.


[^1]:
Uses Python, you will need it.