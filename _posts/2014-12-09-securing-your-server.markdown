---
layout: post
title:  "Securing your server"
subtitle: "Convert your Linux server to a fort"
date:   2014-12-09 23:34:01
category: servers
---

In this post I will show you a few ways to secure your Debian (or Ubuntu) based server. This contains to secure your SSH connection, protecting against brute force and protecting against port scans. Also I will show you how to easily use iptables via an additional package. This is not the holy grail of security, there are really more things you might do. Like using **chroot** and other solutions to make your system secure. This article just shows you how to secure your *SSH* login and how to avoid brute forcing and a few port scans.

**You are an admin, you have to look into server security, don't be lazy and read some articles and manuals. There are more than enough in the WWW, just waiting for you**

**Update 2026:** wrote this in 2014, refreshed the commands since then - *systemd* instead of ```/etc/init.d```, *Ed25519* keys instead of *RSA*, *nftables* under the hood. The ideas didn't change, the tools did.

## Sudo

Debian has not the package **sudo** installed per default. **sudo** enables running commands as **superuser**. To grant this privilege to a user you might add him in the file ```/etc/sudoers``` or add him to the group *sudo*.
Lets start:

        apt-get install sudo

If you want to add a user to the *sudo* group, do that:

        usermod -a -G sudo <username>

For some security reasons, like forbidding non *sudoers* hopping to another account, I am removing execute privileges to the command **su**:

        sudo chmod o-x /bin/su

This will only allow the user *root* or via *sudo* to execute it.

## SSH

This is the most important part, to secure your SSH Server. I assume you know what SSH, ports and *Well known ports* are. At first, do **not** run your SSH instance on port *:22* (otherwise you have really good reasons for that). Mostly bots are trying :22 for brute forcing. Also, never permit **root login**, the user *root* always exists, so it will be the best try to brute force against that username.
Let's start and create a new user:

        [05:42] root@debian [~]:# adduser wirehack7
        Adding user `wirehack7' ...
        Adding new group `wirehack7' (1002) ...
        Adding new user `wirehack7' (1002) with group `wirehack7' ...
        Creating home directory `/home/wirehack7' ...
        Copying files from `/etc/skel' ...
        Enter new UNIX password:
        Retype new UNIX password:
        passwd: password updated successfully
        Changing the user information for wirehack7
        Enter the new value, or press ENTER for the default
                Full Name []:
                Room Number []:
                Work Phone []:
                Home Phone []:
                Other []:
        Is the information correct? [Y/n] y

Okay, we have a new user now.
Let's do the important part to your *sshd*, open ```/etc/ssh/sshd_config``` with your favorite text editor (with *sudo* or as *root*). On newer *Debian* you can also drop a ```*.conf``` file into ```/etc/ssh/sshd_config.d/``` instead of touching the main file. There you will have to change a few lines:


        Port 7654
        PermitRootLogin no
        PasswordAuthentication no

This will change the SSH port to :7654. I recommend you to not use a *Well-Known Port* (ports from 1-1024). Use something above 1024 and make sure nothing is listening on it:

        sudo ss -tulpn | grep :7654

(older guides use ```netstat -tulpn```, but *net-tools* isn't installed on a default *Debian* anymore.)

It should not echo anything, so nothing is running on that port. If something listens on that port, change it.
The settings will disable that the user *root* is able to login and only key authentication can be used.
As the user you just created (*wirehack7* in my example) you need to generate a key pair, the public one will be on the machine we are configuring just now, and the private one will be on our home machine (or from whatever you want to login).
If you are using a Linux based machine, do that:

        ssh-keygen -t ed25519 -C "your_email@example.com"

Back in 2014 this post said *RSA*, use *Ed25519* now - shorter, faster and there is no key size to pick. I highly recommend that you also that a pass-phrase on your key, if it gets leaked the attacker must have also the pass-phrase to use it. Two files are created, **id_ed25519** and **id_ed25519.pub**. Copy the contents of your **id_ed25519.pub** file and switch to your remote connection.
For Windows get puttygen.exe and generate your key pair:

![](https://i.imgur.com/hKEF1Ib.png)

Make sure that you chose **EdDSA** with the **Ed25519** curve (older *PuTTY* only offers **SSH-2 RSA**, then set the bits to 4096, 2048 is okay so far but maybe not for NSA). Copy the content of the box at the top ("Key"). Save your private key to a safe place.

You have to create the folder *.ssh* if it does not exist. Also *SSH* needs a file to read the public key.

        mkdir ~/.ssh
        cd .ssh
        echo "<your copied ssh pub key here>" >> authorized_keys
        chmod 700 ~/.ssh
        chmod 600 ~/.ssh/authorized_keys

**Make sure that the copied line is ONE line and contains no line breaks**
Now, restart your *SSH* daemon:

        sudo systemctl restart ssh

**Do not close your existing remote connection, otherwise you won't be able to connect if anything fails now!**
Open a new connection and use your private key. In Linux do that:

        ssh -i ~/.ssh/id_ed25519 -p <your port> -l <your username> <your ip>

Like:

        ssh -i ~/.ssh/id_ed25519 -p 7654 -l wirehack7 capsop.com

In Windows open putty.exe and edit that part:

![](https://i.imgur.com/8GwokWu.png)

It's in ```Connection -> SSH -> Auth```.

If this works you are done with the *SSH* part, if not, read the text above again and make sure you have done everything right.

## Fail2Ban

Now we get to the protection against brute forcing. *Fail2Ban* listens on some ports for login attempts (and more). After *n* tries it will ban the IP.
Install **fail2ban**:

        sudo apt-get install fail2ban

Don't edit ```/etc/fail2ban/jail.conf``` directly, it gets overwritten on updates. Put your changes in ```/etc/fail2ban/jail.local``` instead (whitelists, number of tries, action to ban, the listened ports/services):

        [sshd]

        enabled  = true
        port     = <your SSH port>
        filter   = sshd[mode=aggressive]
        logpath  = /var/log/auth.log
        maxretry = 3

This will listen on our desired SSH port for login tries, after 3 false tries it will ban the IP. The *aggressive* filter mode also picks up the noisy connection abuse that the old *ssh-ddos* jail used to handle - that filter got removed from *fail2ban*, so don't add it anymore.
I recommend you to read some [manuals](https://github.com/fail2ban/fail2ban/wiki) about *fail2ban*, it is a really powerful tool and can be misconfigured easily.

After editing restart *fail2ban*:

        sudo systemctl restart fail2ban


## UFW
Many will recommend you to use *iptables* by hand, I do so, too. In that way you will understand how a rule works and how the traffic will be processed.
For a simple port configuration you might also use **ufw**. This is just a "helping tool", which means it is kind of a mask for *iptables*.
You install it easily with that:

        sudo apt-get install ufw

After installing you have to allow connections to your port:

        sudo ufw allow <you SSH port>

IPv4 and v6 rules will be added. To enable it simple drop that line:

        sudo ufw enable

You will be prompted if you are sure about this.
**This is not for fun there! If you entered the wrong port and enable it, it will simply drop your connection. Even a restart won't help anymore, you have to get into a rescue mode and disable *ufw* manual.**
*ufw* is simply using whitelisting, all ports which are not allowed are closed. It is even able to do more, just read some manuals about it.

## Portsentry
The counter part of portscanning attacks comes here: **portsentry**. This tool listens on ports and analyses for port scanning attempts, like from **nmap**. This is not the glory grail, this is just a chance to counter some scans. Be honest with yourself here: if *ufw* already drops everything except your *SSH* port, a scan finds nothing anyway. *portsentry* is mostly there to spot and block someone knocking around before they get lucky.
To install do that:

        sudo apt-get install portsentry

*Portsentry* will block nothing now. We have to set a few settings (wouldn't have guessed eh? ;) )
Let's open ```/etc/portsentry/portsentry.conf``` and edit a few lines:

        BLOCK_UDP="1"
        BLOCK_TCP="1"

        # iptables support for Linux
        KILL_ROUTE="/sbin/iptables -I INPUT -s $TARGET$ -j DROP"

This will drop port scan attempts for *TCP* and *UDP* (on newer *Debian* ```/sbin/iptables``` is just a compat shim over *nftables*, the rule still works). I like it that IP's are resolved to names, so you can change that line:

        RESOLVE_HOST = "1"

You have also to whitelist a few IP's, like your DNS servers which are given in ```/etc/resolv.conf```. The file for this is ```/etc/portsentry/portsentry.ignore.static``` **not** ```/etc/portsentry/portsentry.ignore``` (in that file portsentry will store the ignored IP's dynamically, based on your machine and your static file.
We still have a setting to do, the method *portsentry* acts, there are 3 modes:

+ **basic**: This is the mode *portsentry* uses by default. Selected UDP and TCP ports in this mode are bound by *portsentry*, giving the monitored ports the appearance of offering a service to the network.
+ **stealth**: In this mode, *portsentry listens to the ports at the socket level instead of binding the ports. This mode can detect a variety of scan techniques (strobe-style, SYN, FIN, NULL, XMAS and UDP scans), but because it is more sensitive than basic mode, it is likely to produce more false alarms.
+ **advanced stealth**: This mode offers the same detection method as the regular stealth mode, but instead of monitoring only the selected ports, it monitors all ports below a selected number (port number 1023, by default). You can then exclude monitoring of particular ports. This mode is even more sensitive than Stealth mode and is, therefore, more likely to cause false alarms than regular stealth mode.

I recommend stealth for UDP and advanced stealth for TCP. To set this open ```/etc/default/portsentry```:

        TCP_MODE="atcp"
        UDP_MODE="sudp"

Restart *portsentry*:

        sudo systemctl restart portsentry

Hooray, we have a counter to port scans.

## Automatic updates

The laziest win of them all, and it wasn't in the original post: let the box patch itself. Install **unattended-upgrades**:

        sudo apt-get install unattended-upgrades
        sudo dpkg-reconfigure -plow unattended-upgrades

Now security updates land without you logging in. A server you never update is not secure, no matter how many of the steps above you did.

## Afterwork

As mentioned in the entry, this is **not** the holy grail, this is just one of thousands methods to secure a server and gives you a quick overview to the aspects on securing. With more services, more security must be implented, like for MySQL, Apache2 etc.
Don't close your eyes, read about security. You are admin, the users trust you.
