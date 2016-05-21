---
layout: post
title:  "Kippo installing"
subtitle: "Create a honeypot trap for SSH"
date:   2014-11-26 14:12:32
category: itsec
---

Well, I had a post on my own blog describing how to install Kippo as a own honeypot. Due the data loss this post also disappeared. I am writing it again now. So this can be still used as somehow a guide to create own SSH honeypots.

Wait what? Kippo? Yes, [Kippo](https://github.com/desaster/kippo) is a, Python driven, honeypot to mimic SSH behavior. An attacker might think he is on the "real" system and tries to "hack" it. Nice to catch logs of it and all downloaded files.

I will use Debian Wheezy as OS, so please be aware that packages and commands may vary if you are using a different OS. Just search for the correct packages by your OS.

First of all, we will need Python and some Python extensions. To install these on your Debian based machine do this:

        sudo apt-get install build-essential python-dev libmysqlclient-dev python-pip git python-twisted

The wiki of Kippo says that you might use *virtualenv*, well that is your decision, I am using Kippo on cheap low budget VPS, so if anything goes wrong, I just wipe them and install it new.
You will have to install the extensions for Python:

        sudo pip install twisted; sudo pip install pyasn1; sudo pip install pycrypto; sudo pip install MySQL-python

I am running Kippo as a own user, so add the user:

        sudo adduser --disabled-login kippo

This will create a user called 'kippo' with no rights to login (like via SSH). A home directory will be created for him: ```/home/kippo/```. Now run:

        sudo su kippo
        cd ~
        git clone https://github.com/desaster/kippo.git
        cd kippo

Inside this folder are some interesting other folders:

- dl: downloaded files will be stored here
- txtcmds: when the attacker enters a command it will just cat the content to his session
- doc: contains readme files, read them! And contains a MySQL file to be imported to your database
- honeyfs: contains existent files, all files which exist here can be viewed by the attacker (more to that later)
- kippo: contains Kippo itself, the Python scripts
- log: contains the kippo.log and in subfolder tty/ the tty logs of attackers
- utils: contains usefull Python scripts
- data: contains userdb.txt where login data for the honeypot is stored

As I said previous, Kippo mimics a SSH session with environment. As for it, the file-system itself is also simulated. To do this Kippo uses a file with just a list of folders and files. The default file for that is **fs.pickle** in the Kippo root directory. You have to create your own for a proper looking environment. It will "reflect" your machine the script is running on. Files in *fs.pickle* are not stored there, they are just listed. Due that an attacker cannot view it contents. To view a files contains it has to be stored in the same path in the directory ```honeyfs/```. When you want an attacker be able to view ```/home/user/coolscript.sh``` you have to store *coolscript.sh* in ```honeyfs/home/user/```. As you see, you are able to create a really fancy looking file-system environment. Best results you get when creating a Debian instance (if you want to mimic Debian) and install some services on it, for a *kiddo* style server for example gameservers, Teamspeak, user accounts. So they will be included when running **createfs.py**.
For that walkthrough we will just run ```createfs.py``` as root:

        cd utils
        sudo ./createfs.py > fs.pickle

This will take a while and after that you have a new *fs.pickle* file. We have to edit it, deleting the user folder of kippo:

        [05:10] kippo@debian:$ ./fsctl.py fs.pickle
        fs.pickle

        Kippo file system interactive editor
        Donovan Hubbard, Douglas Hubbard, March 2013
        Type 'help' for help

        fs.pickle:/$ cd /home
        fs.pickle:/home$ ls
        user/
        kippo/
        fs.pickle:/home$ rm -r kippo
        lsDeleted /home/kippo
        fs.pickle:/home$ ls
        user/
        fs.pickle:/home$ exit

As described earlier, files will be only readable when they are present in **honeyfs/** and listed in your *fs.pickle*. So let's create some interesting files:

        cd ../honeyfs
        sudo cat /etc/passwd > etc/passwd
        sudo cat /etc/hostname > etc/hostname
        sudo cat /etc/hosts > etc/hosts
        sudo cat /proc/cpuinfo > proc/cpuinfo
        sudo cat /proc/meminfo > proc/meminfo
        sudo cat /proc/version > proc/version
        sudo cat /etc/shadow > etc/shadow

After that, make sure to delete the entries for user *kippo* from *passwd* and *shadow*. Many attackers will cat *cpuinfo* to get known if the standard Kippo one is present.
Now, let's go to the *txtcmds* and edit a few files:

        cd ../txtcmds
        df > bin/df
        dmesg > bin/dmesg
        mount > bin/mount
        ulimit > bin/ulimit
        perl -v > bin/perl
        sudo ifconfig > sbin/ifconfig

You can even create more files. You might have to to mimic a system in a good way, so be creative.

It's time to create the configuration file of Kippo itself. In the directory *kippo* is a file present which is named **kippo.cfg.dist**. Do this in folder *kippo/*

        cp kippo.cfg.dist kippo.cfg

Now open your *kippo.cfg* in your favorite text editor.

Edit the variable *hostname* to suit the content of the file *hostname* and *hosts*.
**Uncomment download_limit_size and set it to a value which suits your system. Otherwise your hole machine can be wasted with downloading some Terabyte of files in your Kippo instance (as noted before, all downloaded files will be stored in *dl/*)**
There are more settings like the SSH version string, just read the file, most of it is self explaining.

As described before, the login data is stored in *userdb.txt* in the *data* folder. You can edit it to add passwords. Here you have to make sure what you want to attract. If you want to attract real humans don't pick a password like *123456*, this would be too obvious. If you want to attract just brute forcing bots *123456* might fit. If an attacker uses **passwd** the password will be also stored here.

To make it reachable via port :22 there are different ways, like port forwarding, using **iptables** etc. I will explain how to use **setcap** to make it reachable via :22.
**Please be noted, I am hardly assuming you won't have running your real SSH instance on :22!**

Install the Debian package for *setcap*:

        sudo apt-get install libcap2-bin

Kippo runs in the interpreter Python, so you will have to allow Python to use :22. To do that, make sure where your Python binary is:

        [05:45] kippo@debian > ~/kippo :$ whereis python
        python: /usr/bin/python /usr/bin/python2.7 /usr/bin/python2.7-config /usr/bin/python2.6 /etc/python /etc/python2.7 /etc/python2.6 /usr/lib/python2.7 /usr/lib/python2.6 /usr/bin/X11/python /usr/bin/X11/python2.7 /usr/bin/X11/python2.7-config /usr/bin/X11/python2.6 /usr/local/lib/python2.7 /usr/local/lib/python2.6 /usr/include/python2.7 /usr/include/python2.6 /usr/share/python /usr/share/man/man1/python.1.gz

*/usr/bin/python* is just a softlink, Python will run per default with **python2.7**, so we do:

        sudo setcap 'cap_net_bind_service=+ep' /usr/bin/python2.7

Now we are able to start Kippo on :22!

Run Kippo:

        [06:02] kippo@debian > ~/kippo :$ ./start.sh
        twistd (the Twisted daemon) 12.0.0
        Copyright (c) 2001-2012 Twisted Matrix Laboratories.
        See LICENSE for details.
        Starting kippo in the background...
        Generating new RSA keypair...
        Done.
        Generating new DSA keypair...
        Done.

Yay, Kippo is running. Now let's test it with opening a connection to :22:

        [06:05] kippo@debian > ~/kippo :$ ssh root@localhost -p 22
        The authenticity of host 'localhost (127.0.0.1)' can't be established.
        RSA key fingerprint is 9d:2a:99:ec:02:ef:20:eb:14:d4:ba:96:4c:9e:6e:3b.
        Are you sure you want to continue connecting (yes/no)? yes
        Warning: Permanently added 'localhost' (RSA) to the list of known hosts.
        Password:
        root@debian:~# ls
        root@debian:~# cat /etc/hostname
        debian
        root@debian:~# ifconfig
        eth0      Link encap:Ethernet  HWaddr 00:4c:a8:ab:32:f4
                  inet addr:10.98.55.4  Bcast:10.98.55.255  Mask:255.255.255.0
                  inet6 addr: fe80::21f:c6ac:fd44:24d7/64 Scope:Link
                  UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
                  RX packets:84045991 errors:0 dropped:0 overruns:0 frame:0
                  TX packets:103776307 errors:0 dropped:0 overruns:0 carrier:2
                  collisions:0 txqueuelen:1000
                  RX bytes:50588302699 (47.1 GiB)  TX bytes:97318807157 (90.6 GiB)

        lo        Link encap:Local Loopback
                  inet addr:127.0.0.1  Mask:255.0.0.0
                  inet6 addr: ::1/128 Scope:Host
                  UP LOOPBACK RUNNING  MTU:16436  Metric:1
                  RX packets:308297 errors:0 dropped:0 overruns:0 frame:0
                  TX packets:308297 errors:0 dropped:0 overruns:0 carrier:0
                  collisions:0 txqueuelen:0
                  RX bytes:355278106 (338.8 MiB)  TX bytes:355278106 (338.8 MiB)
        root@debian:~# passwd
        Enter new UNIX password:
        Retype new UNIX password:
        passwd: password updated successfully
        root@debian:~# exit
        Connection to server closed.

Horray, we mimic a SSH environment!


### Kippo-Graph

There is some really handy tool for Kippo: **[Kippo-Graph](https://github.com/ikoniaris/kippo-graph)**. It is a webinterface to get some nice statistics of your Kippo instances, like used passwords, login combinations and more. It even has a TTY log player!
To use it you have to edit your *kippo.cfg* and add the data for your MySQL Server. Read the instructions of **Kippo-Graph** on how you do this.
I am using it to gather all data from all my honeypots to one system, so I have a good system to view with one click all my data.