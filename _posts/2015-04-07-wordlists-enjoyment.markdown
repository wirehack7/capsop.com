---
layout: post
title:  "Wordlists enjoyment"
subtitle: "Having fun with wordlists of real passwords"
date:   2015-04-07 23:34:01
category: itsec
---

Today I will write about wordlists for hash cracking. I prefer wordlists for a first run against collected hashes which I want to crack. Why? Because these wordlists are mainly build upon leaked databases with real login data from humans. And humans are tending to make the same password over and over. Even two persons which are unknown to each other might use the same password.
Also it will sort out some data before starting with brute forcing. Brute forcing takes his time and not everyone owns a really powerful GPU rig. Yes, there are also rainbow tables, I like them, too. But they are consuming some space, more than wordlists. And these days salts are getting very common, so here comes the wordlist.

I collected some over the past months, you can download my collection [here](http://wordlists.capsop.com/). Yes, there are duplicates. The wordlists there are just copied there, without any enhancement from me. Do it for yourself, please.

## Collecting hashes
For collecting raw hashes to test new techniques etc. I use [TekDefense hashMonitor](https://github.com/1aN0rmus/TekDefense-hashMonitor). It crawls some twitter accounts and pastes for hashes and stores them in a database.
So let's do this:

        ./hashMonitor.py
        [*] Running hashMonitor.py
        https://twitter.com/PastebinDorks
        https://twitter.com/dumpmon
        http://www.leakedin.com/
        [*] Adding links to the DB if they have not been scanned previously.
        [+] Adding http://pastebin.com/raw.php?i=ChKM76se into the DB
        [+] Adding http://pastebin.com/raw.php?i=qKbnfiyk into the DB
        [+] Adding http://pastebin.com/raw.php?i=FeE1gLix into the DB
        [+] Adding http://pastebin.com/raw.php?i=qf0XNyLX into the DB
        [...]
        [-] 63 links were previously scanned
        [+] Searching for hashes in the new URLs
        [-] Unable to collect hashes for http://pastebin.com/raw.php?i=QaYcWuTA
        [-] Unable to collect hashes for http://pastebin.com/raw.php?i=vTbHbb5L
        [*] Inserting new hashes to the DB if any are found.
        [+] Adding 148d35931ed53e6f1480a3d248f8d74e to the DB
        [+] Adding b84cef8dc1ec2ba23a04ff9e7f8fc66b to the DB
        [+] Adding 4e3d0d95eaf5e059ab66b53ee638c1b3 to the DB
        [+] Adding a17f645b0056b6b69b84d2dddbf75a6c to the DB
        [+] Adding 68224ffa51bad93bb4d0156b3e92c928 to the DB
        [+] Adding 20e682499d2490e60957ec82ceda0d80 to the DB
        [...]
        [+] Adding d04f31f2b07b99652771aaf097dbbaf6 to the DB
        [+] Adding f44a225aaa7416a9f9defb36e868e084 to the DB
        [+] Adding 7fdedff9a46e112d70ebcb88342dc99e to the DB
        [+] Adding 87da513f66c7102dc9b986af2d3727b7b7bc7f1c to the DB
        [+] Adding 45c948a0954aa78bb5c23801aa5d9eb7 to the DB
        [+] Adding 72d2b14a82c4aaa112409d887477637c to the DB
        [+] Adding 6e4e1baa529639d0b65741f138db7a731cad08e5e97cf9975cfa44fa7db52343 to the DB
        [+] Adding a6eb594c8f1cbf4f9cae598f1937875a to the DB
        [+] Added 887 Hashes to the Database

Let's see how many we have there:

        ./hashMonitor.py -s
        [*] Running hashMonitor.py
        [+] MD5: 11660
        [+] SHA1: 1712
        [+] SHA256: 425
        [+] You have collected a total of 13797 hashes in this database!
        [+] You have scraped a total of 183 URLs listed in this database!


Let's test the *MD5* ones:

        ./hashMonitor.py -l MD5 -o ~/cracking/hashmonitor_MD5.txt
        [+] Printing results to file: /home/hashing/cracking/hashmonitor_MD5.txt

Okay, run it against the shared wordlists from me:

        hashcat -m0 --remove -o hashmonitor_MD5.cracked.txt --outfile-format=3 hashmonitor_MD5.txt ~/wordlists/

Finished, let us see the result:

        $: wc -l hashmonitor_MD5.*
        6701 hashmonitor_MD5.cracked.txt
        4959 hashmonitor_MD5.txt

As we see above, it were **11660** plain MD5 hashes. 6701 cracked so far only with the wordlists. You see, people like to use the same password over and over again. To crack the rest I assume using sites like [hashes.org](http://hashes.org/) or [hashkiller.co.uk](http://hashkiller.co.uk/md5-decrypter.aspx). Also you might fire up hashcat to bruteforce or maybe test it on [Amazon EC2](http://du.nham.ca/blog/posts/2013/03/08/password-cracking-on-amazon-ec2/).

Let's do some statistics at the end with [pipal](https://github.com/digininja/pipal):

[Statistics paste](https://0bin.capsop.com/?a1cdd84b92a0190f#db/tgYQVfQgPclxAm9hvVhMSN0/Hrp5n78/THy/90ps=) (too long for blog post).

Here are also some nice resources for wordlists:

- [g0tmi1k's wordlists](https://blog.g0tmi1k.com/2011/06/dictionaries-wordlists/)
- [Packet storm](http://packetstormsecurity.com/Crackers/wordlists/)
- [Skullsecurity](https://wiki.skullsecurity.org/Passwords)
- [Crackstation (paid version)](https://crackstation.net/buy-crackstation-wordlist-password-cracking-dictionary.htm)

Hope you found something useful with that blog post.

Thanks fly out to:

- [@GelosSnake](https://twitter.com/GelosSnake)
- [@paulwebsec](https://twitter.com/PaulWebSec)
- [@g0tm1lk](https://twitter.com/g0tmi1k)

All nice to follow.


----------
![](https://i.imgur.com/0kM42qR.jpg)