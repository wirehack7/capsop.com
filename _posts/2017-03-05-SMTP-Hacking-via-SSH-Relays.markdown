---
layout: post
title:  "SMTP Hacking via SSH TCP Forwarding Attacken"
subtitle: "Neue Kampagne um Mailserver zu kompromitieren"
categories: [itsec,German,MalwareMustDie]
typora-copy-images-to: ipic
---

Wie bereits in [diesem Post](http://blog.malwaremustdie.org/2017/02/mmd-0062-2017-ssh-direct-tcp-forward-attack.html) (**[MMD-0062-2017 - Credential harvesting by SSH Direct TCP Forward attack via IoT botnet](http://blog.malwaremustdie.org/2017/02/mmd-0062-2017-ssh-direct-tcp-forward-attack.html)**) von **MalwareMustDie** erwähnt werden derzeit vermehrt *SSH-Server* angegriffen um diese als Relay für weitere Angriffe, wie auf SMTP, zu verwenden. Zum besseren Verständnis dient das nachfolgende Bild des Schemas:

![Angriffsschema](https://i.imgur.com/8BhISBS.png)

Zu sehen ist wie *SSH* angegriffen wird, welche wiederum *IoT* Geräte (darunter Kameras und Babyphones) angreifen. Diese Geräte greifen dann Server an um weitere Daten zu erhalten. Hierbei werden Listen mit Logindaten verwendet, daher werden meist schlecht abgesicherte Server komprimitiert, jedoch erscheinen diese im weiteren Verlauf dann als Angreifer.

Die *SMTP* Server werden jedoch nach dem erfolgreichen "Hack" nicht zum Spamversand benutzt, sondern es werden weitere Daten abgegriffen. Zum Beispiel im Bezug des Kreditkartenbetrugs ("Carding"). Die gestohlenen Daten dienen auch dazu die Logindaten für das Brute Forcing zu erweitern.

<div class="videoWrapper"><iframe width="560" height="315" src="https://www.youtube.com/embed/H6A-lpn2cdY" frameborder="0" allowfullscreen></iframe></div>

Hier ist eine Liste von komprimitierten Mailservern:

![](https://i.imgur.com/Mt2FsGB.jpg)

![](https://i.imgur.com/DGcGIY3.jpg)

Diese Methode ist dahingehend beachtlich da hierbei weitere Ebenen zur Verschleierung benutzt werden. Auch dass diese Attacke derzeit nur dazu dient Daten zu sammeln.

Für weitere technische Details empfehle ich den erwähnten Post durchzulesen.

Dieser Post dient hauptsächlich dazu auf diese Attacke aufmerksam zu machen und die bereits kompromitierten Server in Deutschland. nachfolgend ist [eine Liste](https://gist.github.com/unixfreaxjp/2def00d658ce5db948f6f790606aa0bc) welche am Freitag, 03.03.2017, erstellt wurde. Ich bitte darum die Betreiber zu warnen/kontaktieren und weitere erforderlichen Schritte zu tätigen.

Hier ist ein Screenshot in welchem man sieht dass deutsche Mailserver ebenso betroffen sind:

![](https://i.imgur.com/pOXMlZS.jpg)

![](https://i.imgur.com/FqrgU8E.jpg)

Hier ist ein Beweis dass die Angriffe genutzt werden um unter anderem an PayPal Informationen zu kommen:

![](https://i.imgur.com/Vs0QLPC.jpg)

Das [gesamte Repository](https://github.com/unixfreaxjp/MMD-0062-2017) enthält weitere Details von angreifenden und angegriffenen Zielen.

```
109.199.184.204 | nd4.ccnst.de. |197524 | 109.199.160.0/19 | CCNST | DE | ccnst.de | CCNST Christof Englmeier e.K.
109.230.231.53 | w.your.ru.net. |197071 | 109.230.224.0/20 | ACTIVE | DE | serverbiz.de | Serverbiz HN
109.230.231.60 | interact.corporationoffers.info. |197071 | 109.230.224.0/20 | ACTIVE | DE | serverbiz.de | Serverbiz HN
109.230.231.92 | p.your.ru.net. |197071 | 109.230.224.0/20 | ACTIVE | DE | serverbiz.de | Serverbiz HN
109.234.109.37 | whois.rrpproxy.net. |196763 | 109.234.104.0/21 | KEY-SYSTEMS | DE | key-systems.net | Key-Systems GmbH
109.234.109.85 | ns7.expirationwarning.net. |196763 | 109.234.104.0/21 | KEY-SYSTEMS | DE | key-systems.net | Key-Systems GmbH
109.234.218.23 | srv1.schwarzer.de. |44335 | 109.234.218.0/24 | NOCYO | DE | nocyo.de | nocyo GmbH
109.237.132.30 | alfa3074.alfahosting-server.de. |21413 | 109.237.128.0/20 | ENVIA-TEL | DE | alfahosting.de | Alfahosting GmbH
129.143.2.71 | cst101.belwue.de. |553 | 129.143.0.0/16 | BELWUE | EU | uni-stuttgart.de | Universitaet Stuttgart
131.220.14.124 | x30.rhrz.uni-bonn.de. |680 | 131.220.0.0/16 | DFN | DE | uni-bonn.de | Rheinische Friedrich-Wilhelms-Universitaet Bonn
131.220.14.79 | x47-as.rhrz.uni-bonn.de. |680 | 131.220.0.0/16 | DFN | DE | uni-bonn.de | Rheinische Friedrich-Wilhelms-Universitaet Bonn
134.106.238.243 |  |680 | 134.104.0.0/14 | DFN | DE | uni-oldenburg.de | Universitaet Oldenburg
134.119.253.46 | dom.ispgateway.de. |20773 | 134.119.253.0/24 | HOSTEUROPE | DE | domainfactory.de | domainfactory GmbH
134.119.86.136 | m03s20-7-42db.ispgateway.de. |20773 | 134.119.86.0/24 | HOSTEUROPE | DE | domainfactory.de | domainfactory GmbH
134.1.2.16 | mails2.awi.de. |680 | 134.1.0.0/16 | DFN | DE | awi-potsdam.de | Alfred-Wegener-Institut Helmholtz-Zentrum Fuer Polar- und Meeresforschung
134.91.18.235 |  |680 | 134.91.0.0/16 | DFN | DE | uni-due.de | Universitaet Duisburg-Essen
134.98.66.81 | mx.visionice.de. |3209 | 134.98.0.0/16 | VODANET | DE | wind-internethaus.de | Wind Internethaus GmbH
136.243.205.69 | static.69.205.243.136.clients.your-server.de. |24940 | 136.243.0.0/16 | HETZNER | DE | your-server.de | Cybex Hosting
136.243.58.37 | static.37.58.243.136.clients.your-server.de. |24940 | 136.243.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
136.243.80.213 | static.213.80.243.136.clients.your-server.de. |24940 | 136.243.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
138.201.29.49 | static.49.29.201.138.clients.your-server.de. |24940 | 138.201.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
138.201.86.77 | n116.domenomania.pl. |24940 | 138.201.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
138.201.89.241 | merlin.epiclink.net. |24940 | 138.201.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
138.68.81.148 |  |201229 | 138.68.64.0/19 | DIGITALOCEAN | DE | dupont.com | E.I. Dupont de Nemours and Company Inc.
139.162.165.12 | li1482-12.members.linode.com. |63949 | 139.162.160.0/19 | LINODE | US | oceanos.net | Default ISP
139.162.166.48 | c1431.cloudnet.se. |63949 | 139.162.160.0/19 | LINODE | US | oceanos.net | Default ISP
139.18.1.26 | v1.rz.uni-leipzig.de. |680 | 139.18.0.0/16 | DFN | DE | uni-leipzig.de | University of Leipzig
139.18.1.27 | v2.rz.uni-leipzig.de. |680 | 139.18.0.0/16 | DFN | DE | uni-leipzig.de | University of Leipzig
139.59.157.2 |  |201229 | 139.59.128.0/19 | DIGITALOCEAN | DE | sri.com | SRI
139.6.1.61 | lvs2.nz.FH-Koeln.DE. |680 | 139.6.0.0/16 | DFN | DE | fh-koeln.de | Fachhochschule Koeln
141.30.67.69 | mailin6.zih.tu-dresden.de. |680 | 141.30.0.0/16 | DFN | DE | inf.tu-dresden.de | Technische Universitaet Dresden
144.76.120.237 | static.237.120.76.144.clients.your-server.de. |24940 | 144.76.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
144.76.137.66 | tux269.hoststar.ch. |24940 | 144.76.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
144.76.202.77 | static.77.202.76.144.clients.your-server.de. |24940 | 144.76.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
144.76.62.180 | zscomp.ru. |24940 | 144.76.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
144.76.85.194 | panther2.dow-media.com. |24940 | 144.76.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
144.76.91.121 | ns1.vip.gr. |24940 | 144.76.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
145.253.245.122 | mail1.paulmann.de. |3209 | 145.253.0.0/16 | VODANET | DE | paulmann.de | Paulmann Licht GmbH
146.0.234.124 |  |29066 | 146.0.224.0/19 | VELIANET | DE | visnet.ro | VisNetwork Media S.R.L.
146.0.234.125 |  |29066 | 146.0.224.0/19 | VELIANET | DE | visnet.ro | VisNetwork Media S.R.L.
146.0.239.18 |  |204116 | 146.0.239.0/24 | FYBER | DE | visnet.ro | VisNetwork Media S.R.L.
146.0.239.21 |  |204116 | 146.0.239.0/24 | FYBER | DE | visnet.ro | VisNetwork Media S.R.L.
146.0.239.22 |  |204116 | 146.0.239.0/24 | FYBER | DE | visnet.ro | VisNetwork Media S.R.L.
146.0.239.38 |  |204116 | 146.0.239.0/24 | FYBER | DE | visnet.ro | VisNetwork Media S.R.L.
148.251.155.196 | core.gethos.net. |24940 | 148.251.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
148.251.52.233 | static.233.52.251.148.clients.your-server.de. |24940 | 148.251.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
148.251.6.54 | mx6.csof.net. |24940 | 148.251.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
148.251.6.55 | mx5.csof.net. |24940 | 148.251.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
149.238.61.42 | mx08.zf.com. |21263 | 149.238.0.0/16 | TELEDATA | DE | zf.com | ZF Friedrichshafen AG
149.239.171.9 |  |12291 | 149.239.128.0/17 | , | DE | deutschepost.de | Deutsche Post AG
151.189.21.114 | imap.arcor-online.net. |3209 | 151.189.0.0/16 | VODANET | DE | vodafone.com | Vodafone D2 GmbH
151.189.21.118 | mx.arcor.de. |3209 | 151.189.0.0/16 | VODANET | DE | vodafone.com | Vodafone D2 GmbH
153.92.174.108 |  |60664 | 153.92.174.0/24 | X | DE | null.com | Hosting Services Host Slim
153.92.174.58 | mx2.oxcloud-vadesecure.net. |60664 | 153.92.174.0/24 | X | DE | null.com | Hosting Services Host Slim
153.92.174.59 | mx1.oxcloud-vadesecure.net. |60664 | 153.92.174.0/24 | X | DE | null.com | Hosting Services Host Slim
153.92.65.114 |  |60664 | 153.92.65.0/24 | X | DE | - | Hybrid Domains
172.111.200.197 |  |61317 | 172.111.200.0/24 | ASDETUK | GB | - | -
176.199.157.206 | ip-176-199-157-206.hsi06.unitymediagroup.de. |6830 | 176.199.0.0/16 | LGI | AT | unitymedia.de | Unitymedia NRW GmbH
176.28.17.34 | www.hochfein.net. |20773 | 176.28.0.0/18 | HOSTEUROPE | DE | hosteurope.de | Hosteurope GmbH
176.9.138.249 | ns1.magichost.ro. |24940 | 176.9.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
176.9.163.139 | barracuda.gruppo4.com. |24940 | 176.9.0.0/16 | HETZNER | DE | your-server.de | Gruppo 4 s.r.l.
178.238.234.196 | host1.hostkerberos.com. |51167 | 178.238.234.0/23 | CONTABO | DE | contabo.de | Contabo GmbH
178.250.10.88 | cloud1-vm182.de-nserver.de. |34432 | 178.250.8.0/21 | PHH | DE | profihost.com | Profihost AG
178.254.27.5 | mail1.evanzo-server.de. |42730 | 178.254.0.0/19 | EVANZOAS | DE | evanzo.de | EVANZO e-commerce GmbH
178.254.50.203 | pp1.greatnet.de. |42730 | 178.254.50.0/24 | EVANZOAS | DE | evanzo.de | EVANZO e-commerce GmbH
178.63.19.178 | 178.63.19.178.ownweb.ru. |24940 | 178.63.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
178.63.25.182 | s1.swaydo.de. |24940 | 178.63.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
185.15.192.57 | mx2.agenturserver.de. |15817 | 185.15.192.0/22 | MITTWALD | DE | mittwald.de | Mittwald CM Service GmbH und Co.KG
185.19.218.137 |  |29066 | 185.19.216.0/22 | VELIANET | DE | velia.net | velia.net Internetdienste GmbH
185.21.102.51 | hoggan.ispgateway.de. |20773 | 185.21.102.0/24 | HOSTEUROPE | DE | domainfactory.de | domainfactory GmbH
185.53.177.20 |  |61969 | 185.53.176.0/22 | TEAMINTERNET | DE | teaminternet.de | Team Internet AG
185.53.177.30 |  |61969 | 185.53.176.0/22 | TEAMINTERNET | DE | teaminternet.de | Team Internet AG
185.53.177.31 |  |61969 | 185.53.176.0/22 | TEAMINTERNET | DE | teaminternet.de | Team Internet AG
185.53.178.29 |  |61969 | 185.53.176.0/22 | TEAMINTERNET | DE | teaminternet.de | Team Internet AG
185.53.178.7 |  |61969 | 185.53.176.0/22 | TEAMINTERNET | DE | teaminternet.de | Team Internet AG
185.53.178.8 |  |61969 | 185.53.176.0/22 | TEAMINTERNET | DE | teaminternet.de | Team Internet AG
185.53.178.9 |  |61969 | 185.53.176.0/22 | TEAMINTERNET | DE | teaminternet.de | Team Internet AG
185.53.179.15 |  |61969 | 185.53.176.0/22 | TEAMINTERNET | DE | teaminternet.de | Team Internet AG
185.53.179.29 |  |61969 | 185.53.176.0/22 | TEAMINTERNET | DE | teaminternet.de | Team Internet AG
185.53.179.6 |  |61969 | 185.53.176.0/22 | TEAMINTERNET | DE | teaminternet.de | Team Internet AG
185.53.179.7 |  |61969 | 185.53.176.0/22 | TEAMINTERNET | DE | teaminternet.de | Team Internet AG
185.53.179.8 |  |61969 | 185.53.176.0/22 | TEAMINTERNET | DE | teaminternet.de | Team Internet AG
185.67.36.63 | mailin03.posteo.de. |8495 | 185.67.36.0/23 | INTERNET_AG | DE | posteo.de | Posteo e.K.
185.93.116.167 |  |39647 | 185.93.116.0/22 | REDHOSTING | NL | onephone.de | Onephone Deutschland GmbH
188.138.56.29 | mx28.antispamcloud.com. |8972 | 188.138.0.0/17 | PLUSSERVER | DE | plusserver.de | PlusServer AG
188.138.75.171 | server1.standingouthosting.be. |8972 | 188.138.75.0/24 | PLUSSERVER | DE | plusserver.de | PlusServer AG
188.40.253.84 | server.panther.org.uk. |24940 | 188.40.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
188.40.87.68 | rey.cdlg.de. |24940 | 188.40.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
188.93.11.58 | m17s3-2-2da.ispgateway.de. |20773 | 188.93.11.0/24 | HOSTEUROPE | DE | domainfactory.de | domainfactory GmbH
188.94.27.178 | ojooo04.nmmn.com. |20694 | 188.94.24.0/21 | NMMN | DE | nmmn.net | NMMN New Media Markets & Networks IT-Services GmbH
192.109.176.17 | mail1.backupservers.de. |3209 | 192.109.176.0/24 | VODANET | DE | wind-internethaus.de | Wind Internethaus GmbH
192.166.192.44 | satabbor.cronon.de. |6786 | 192.166.192.0/21 | CRONON-BERLIN | DE | cronon.net | Cronon AG
193.158.110.35 | mxgate02.telemed.de. |3320 | 193.158.0.0/15 | DTAG | DE | telemed.de | Telemed GmbH
193.158.110.36 | mxgate03.telemed.de. |3320 | 193.158.0.0/15 | DTAG | DE | telemed.de | Telemed GmbH
193.158.123.94 | 94.64.123.158.193.in-addr.arpa. ; mailx.tcommerce.de. |3320 | 193.158.0.0/15 | DTAG | DE | telekom.de | Deutsche Telekom AG
193.197.148.18 | mail1.bwl.de. |553 | 193.196.0.0/15 | BELWUE | EU | uni-stuttgart.de | Universitaet Stuttgart
193.27.50.112 | idsmailin14.datevnet.de. |15451 | 193.27.48.0/21 | , | DE | datev.de | DATEV eG
194.116.187.5 | mail.planet-school.de. |45031 | 194.116.187.0/24 | PROVIDERBOX | DE | pswebhosting.net | planet school webhosting Leslie Schnee e.K.
194.145.224.124 | mxtls.expurgate.net. |8928 | 194.145.224.0/24 | INTEROUTE | GB | expurgate.net | CYREN GmbH
194.173.174.126 | mgw2.it2media.de. |12655 | 194.173.174.0/23 | AS12655 | DE | vhm-ibb.de | Fernsprechbuch-Verlag Hans Mueller GmbH + Co.
194.245.148.9 | mailfw4.joker-forward.com. |5517 | 194.245.0.0/16 | CSL | DE | csl.de | CSL Computer Service Langenbach GmbH
194.25.134.110 | sfwd01.sul.t-online.de. |3320 | 194.25.0.0/16 | DTAG | DE | telekom.de | Deutsche Telekom AG
194.25.134.114 | email01.t-online.de. |3320 | 194.25.0.0/16 | DTAG | DE | telekom.de | Deutsche Telekom AG
194.25.134.46 | sfwd00.sul.t-online.de. |3320 | 194.25.0.0/16 | DTAG | DE | telekom.de | Deutsche Telekom AG
194.25.134.51 | email02.t-online.de. |3320 | 194.25.0.0/16 | DTAG | DE | telekom.de | Deutsche Telekom AG
194.25.134.72 | mx01.t-online.de. |3320 | 194.25.0.0/16 | DTAG | DE | telekom.de | Deutsche Telekom AG
194.25.134.73 | mx03.t-online.de. |3320 | 194.25.0.0/16 | DTAG | DE | telekom.de | Deutsche Telekom AG
194.25.134.76 | smtp-01.tld.t-online.de. |3320 | 194.25.0.0/16 | DTAG | DE | telekom.de | Deutsche Telekom AG
194.25.134.8 | mx00.t-online.de. |3320 | 194.25.0.0/16 | DTAG | DE | telekom.de | Deutsche Telekom AG
194.25.134.88 |  |3320 | 194.25.0.0/16 | DTAG | DE | telekom.de | Deutsche Telekom AG
194.25.134.9 | mx02.t-online.de. |3320 | 194.25.0.0/16 | DTAG | DE | telekom.de | Deutsche Telekom AG
194.25.41.26 |  |3320 | 194.25.0.0/16 | DTAG | DE | mediabeam.com | mediaBEAM GmbH
194.25.93.180 |  |3320 | 194.25.0.0/16 | DTAG | DE | - | Mueller Hohl & Co. Industrie U. Dienstleistungen
194.59.36.38 | k1z02s004.kivbf.de. |50964 | 194.59.36.0/24 | KIVBF | DE | kivbf.de | Kommunale Informationsverarbeitung Baden-Franken
194.76.65.92 | mail.kdo.de.; mail-gw.kdo.de. ; mailgw-cluster.kdo.de. |6687 | 194.76.64.0/19 | KDO | DE | kdo.de | Kommunale Datenverarbeitung Oldenburg - KDO
194.94.44.73 | ironport1.embl.de. |680 | 194.94.0.0/15 | DFN | DE | embl.de | European Molecular Biology Laboratory
194.97.45.16 | email.freenet.de. |5430 | 194.97.0.0/18 | FREENETDE | DE | freenet-rz.de | freenet Datenkommunikations GmbH
195.140.123.76 | relay263.s-web.de. |9099 | 195.140.64.0/18 | FINANZINFORMATIK-AS | DE | f-i.de | Finanz Informatik GmbH & Co. KG
195.189.93.103 | mx4.rz-kiru.de. |41040 | 195.189.93.0/24 | IIRU | DE | rz-kiru.de | Interkommunale Informationsverarbeitung Reutlingen-Ulm GmbH
195.190.135.11 | mxa11.expurgate.net. |8220 | 195.190.135.0/24 | COLT | GB | expurgate.net | CYREN GmbH
195.190.135.121 | mxtls.expurgate.net. |8220 | 195.190.135.0/24 | COLT | GB | expurgate.net | CYREN GmbH
195.190.135.122 | mxtls.expurgate.net. |8220 | 195.190.135.0/24 | COLT | GB | expurgate.net | CYREN GmbH
195.200.45.10 |  |15590 | 195.200.40.0/21 | FIDUCIA | DE | fiducia.de | Fiducia IT AG
195.200.70.104 | mail104.bayern.de. |3209 | 195.200.70.0/23 | VODANET | DE | bayern.de | Bayerische Landesamt fuer Statistik und Datenverarbeitung
195.20.236.93 | stylecom.co.uk. |8560 | 195.20.224.0/19 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
195.245.230.131 | mail78.messagelabs.com. |21345 | 195.245.230.0/24 | SYMANTEC | GB | symantec.com | Messagelabs Limited
195.253.23.173 | whois-be1.corenic.net. |8391 | 195.253.0.0/16 | KNIPP | DE | corenic.net | Internet Council of Registrars
195.4.92.210 | virtual0.mx.freenet.de. |5430 | 195.4.0.0/16 | FREENETDE | DE | freenet.de | freenet.de GmbH
195.4.92.211 | virtual1.mx.freenet.de. |5430 | 195.4.0.0/16 | FREENETDE | DE | freenet.de | freenet.de GmbH
195.4.92.215 | emig-v0.freenet.de. |5430 | 195.4.0.0/16 | FREENETDE | DE | freenet.de | freenet.de GmbH
195.4.92.216 | emig-v1.freenet.de. |5430 | 195.4.0.0/16 | FREENETDE | DE | freenet.de | freenet.de GmbH
195.4.92.217 | emig-v2.freenet.de. |5430 | 195.4.0.0/16 | FREENETDE | DE | freenet.de | freenet.de GmbH
195.4.92.218 | emig-v3.freenet.de. |5430 | 195.4.0.0/16 | FREENETDE | DE | freenet.de | freenet.de GmbH
195.49.229.129 |  |28674 | 195.49.224.0/21 | ITERGO-CORP | DE | itergo.net | ITERGO Informationstechnologie GmbH
195.93.85.39 | parked-shared-frr.evip.aol.com. |1668 | 195.93.0.0/17 | AOL-ATDN | US | aol.net | AOL Online Inc.
212.18.1.34 | mail1.donotspam.de. |8767 | 212.18.0.0/19 | MNET | DE | m-online.net | Indevis GmbH
212.184.64.29 | mailrelayb.dillinger.de. |3320 | 212.184.0.0/15 | DTAG | DE | - | TSI fuer Saarstahl AG
212.223.165.71 | frontend.clustermail.de. |8741 | 212.223.0.0/16 | RATIOKONTAKT | DE | ratiokontakt.de | Ratiokontakt GmbH
212.224.105.17 | cax.virusfree.cz. |44066 | 212.224.64.0/18 | DE | DE | first-colo.net | First Colo GmbH
212.224.105.18 | tbx.virusfree.cz. |44066 | 212.224.64.0/18 | DE | DE | first-colo.net | First Colo GmbH
212.224.105.19 | cbx.virusfree.cz. |44066 | 212.224.64.0/18 | DE | DE | first-colo.net | First Colo GmbH
212.227.15.10 | mx00.gmx.net. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.15.142 | smtp.1and1.es. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.15.17 | mx-ha03.web.de. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.15.184 | auth.smtp.1and1.fr. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.15.229 | whois.1and1.org. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.15.30 | mx00.caramail.com. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.15.40 | mx00.emig.kundenserver.de. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.15.41 | mx00.kundenserver.de. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.15.9 | mx00.emig.gmx.net. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.17.162 | imap.web.de. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.17.168 | mail.gmx.net. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.17.170 | imap.gmx.net. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.17.174 | mail.gmx.com. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.17.178 | imap.web.de. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.17.184 | mail.gmx.com. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.17.186 | imap.gmx.net. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.17.190 | mail.gmx.net. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.17.4 | mx01.gmx.net. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.17.5 | mx01.emig.gmx.net. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.227.17.8 | mx-ha02.web.de. |8560 | 212.227.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
212.34.175.250 | mx3.odn.de. |12348 | 212.34.160.0/19 | AS12348 | DE | odn.de | ODN Onlinedienst Nordbayern GmbH & Co. KG
212.48.97.68 | mailin100.artfiles.de. |8893 | 212.48.96.0/19 | ARTFILES | DE | artfiles.de | Artfiles IP Network
212.64.225.221 | smtpmx02.bayer.de. |13043 | 212.64.224.0/19 | , | DE | bayer.de | Bayer AG Germany Leverkusen
212.65.1.68 | ironport2.mannheim.de. |21473 | 212.65.0.0/19 | MANET | DE | mannheim.de | Stadt Mannheim
212.7.146.1 | mx01.versatel.de. |8881 | 212.7.128.0/19 | VERSATEL | DE | versatel.de | Versatel Deutschland
213.133.111.209 | tux139.loginserver.ch. |24940 | 213.133.96.0/19 | HETZNER | DE | hetzner.de | Hetzner Online AG
213.136.77.178 | vmi61693.contabo.host. |51167 | 213.136.76.0/23 | CONTABO | DE | contabo.de | Contabo GmbH
213.165.67.108 | smtp.web.de. |8560 | 213.165.64.0/19 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
213.165.67.124 | smtp.web.de. |8560 | 213.165.64.0/19 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
213.174.32.95 | mailcluster.ims-firmen.de.; mail.ims-firmen.de. |61157 | 213.174.32.0/19 | TGOS | DE | .internet24.de | internet24 GmbH
213.191.73.2 | email.hansenet.de. |6805 | 213.191.64.0/19 | TDDE | DE | hansenet.de | HanseNet Telekommunikation GmbH
213.216.11.46 | nero.vistecprivat.de. |20792 | 213.216.0.0/19 | VISTEC | DE | vistec.net | VISTEC Internet Service GmbH
213.221.114.131 | mail.beauty24.de. |8426 | 213.221.64.0/18 | CLARANET | GB | clara.net | Web /Mailserver
213.23.74.51 | mail.kfzgewerbe.de. |3209 | 213.23.0.0/16 | VODANET | DE | kfzgewerbenet.de | Zentralverband Deutsches Kraftfahrzeuggewerbe
213.239.195.176 | tux5.hoststar.ch. |24940 | 213.239.192.0/18 | HETZNER | DE | hetzner.de | Hetzner Online AG
213.239.214.163 | s0003.shadowconnect.net. |24940 | 213.239.192.0/18 | HETZNER | DE | hetzner.de | Hetzner Online AG
213.252.31.88 | 88.ipandmore.de. |12907 | 213.252.0.0/18 | IPANDMORE | DE | ipandmore.de | Thomas Mueller
213.95.151.133 | www.worldshop.eu. |12337 | 213.95.0.0/16 | NORIS | DE | worldshop.eu | MAC Main Aiport Center
213.95.81.224 | mx.schmetterling-argus.de. |12337 | 213.95.0.0/16 | NORIS | DE | schmetterling-argus.de | Hauptstrasse
217.111.120.6 | mailin1.rmx.de. |8220 | 217.110.0.0/15 | COLT | GB | retarus.de | retarus GmbH
217.118.19.158 | mx29.antispamcloud.com. |8972 | 217.118.16.0/20 | PLUSSERVER | DE | plusserver.de | PlusServer AG
217.13.200.24 | mail.worldserver.net. |15657 | 217.13.192.0/20 | SPEEDBONE | DE | speedbone.de | Speedbone Internet & Connectivity GmbH
217.140.66.19 |  |20640 | 217.140.64.0/21 | TITAN | DE | amateurcommunity.com | IP Broadcasting B.V.
217.160.0.253 | 217-160-0-253.elastic-ssl.ui-r.com. |8560 | 217.160.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
217.160.223.123 | kundenserver.de. |8560 | 217.160.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
217.237.191.174 | mailgate2.vega.com. |3320 | 217.224.0.0/11 | DTAG | DE | vega.com | Vega Grieshaber KG
217.5.140.50 |  |3320 | 217.0.0.0/13 | DTAG | DE | eko-stahl.de | ArcelorMittal EisenhuettenstadtGmbH
217.70.175.40 | sinope.core.gelsen.net. |16024 | 217.70.160.0/20 | GELSEN | DE | gelsen-net.de | GELSEN-NET Kommunikationsgesellschaft mbH
217.72.192.66 | mx01.emig.kundenserver.de. |8560 | 217.72.192.0/20 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
217.72.192.67 | mx01.kundenserver.de. |8560 | 217.72.192.0/20 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
217.72.192.76 | mx01.caramail.com. |8560 | 217.72.192.0/20 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
217.92.152.159 | remote.accentform.com. |3320 | 217.80.0.0/12 | DTAG | DE | telekom.de | Deutsche Telekom AG
31.25.48.11 | mx01.xworks.net. |3320 | 31.25.48.0/21 | DTAG | DE | mediabeam.com | mediaBEAM GmbH Net
37.120.190.25 | mail3.mxfer.de. |197540 | 37.120.160.0/19 | NETCUP | DE | netcup.de | netcup GmbH
46.101.177.59 |  |201229 | 46.101.128.0/17 | DIGITALOCEAN | DE | digitalocean.com | Digital Ocean Inc.
46.165.205.84 | hosted-by.leaseweb.com. |28753 | 46.165.192.0/18 | LEASEWEB | DE | leaseweb.com | Leaseweb Germany GmbH
46.165.222.180 | mx8.antispamcloud.com. |28753 | 46.165.192.0/18 | LEASEWEB | DE | leaseweb.com | Leaseweb Germany GmbH
46.165.223.16 | mx9.antispamcloud.com. |28753 | 46.165.192.0/18 | LEASEWEB | DE | leaseweb.com | Leaseweb Germany GmbH
46.165.224.87 | mx20.antispamcloud.com. |28753 | 46.165.192.0/18 | LEASEWEB | DE | leaseweb.com | Leaseweb Germany GmbH
46.165.229.223 | disual.s2srv.net. |28753 | 46.165.192.0/18 | LEASEWEB | DE | leaseweb.com | Leaseweb Germany GmbH
46.228.203.207 | server1.draculaweb.com. |24961 | 46.228.192.0/20 | MYLOC | DE | myloc.de | myLoc managed IT AG
46.252.18.173 | coron.ispgateway.de. |20773 | 46.252.18.0/24 | HOSTEUROPE | DE | domainfactory.de | domainfactory GmbH
46.38.247.45 | wf72d.netcup.net. |197540 | 46.38.240.0/21 | NETCUP | DE | netcup.de | netcup GmbH
46.4.147.180 | mail1.emea.globalroaming.com. |24940 | 46.4.0.0/16 | HETZNER | DE | globalroaming.com | Sharp Rock Technologies
46.4.150.159 | mail.mutantbrains.com. |24940 | 46.4.0.0/16 | HETZNER | DE | your-server.de | MutantBrains
46.4.91.147 | vereon.ru. |24940 | 46.4.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
5.10.186.42 | b2b-5-10-186-42.unitymedia.biz. |6830 | 5.10.176.0/20 | LGI | AT | unitymedia.de | Unitymedia NRW GmbH
5.104.111.206 | ve834.venus.fastwebserver.de. |24961 | 5.104.104.0/21 | MYLOC | DE | postaust.com | Sergey Karpenko
5.189.135.62 | vmd9223.contabo.host. |51167 | 5.189.128.0/20 | CONTABO | DE | contabo.de | Contabo GmbH
5.22.149.135 | url-forwarding.moniker.com. |196763 | 5.22.148.0/22 | KEY-SYSTEMS | DE | key-systems.net | Key-Systems GmbH
52.28.66.51 | ec2-52-28-66-51.eu-central-1.compute.amazonaws.com. |16509 | 52.28.0.0/16 | AMAZON-02 | US | amazon.com | Amazon Technologies Inc.
52.57.110.0 | ec2-52-57-110-0.eu-central-1.compute.amazonaws.com. |16509 | 52.57.0.0/16 | AMAZON-02 | US | dupont.com | E.I. du Pont de Nemours and Co. Inc.
52.59.30.30 | ec2-52-59-30-30.eu-central-1.compute.amazonaws.com. |16509 | 52.58.0.0/15 | AMAZON-02 | US | dupont.com | E.I. du Pont de Nemours and Co. Inc.
54.93.98.119 | ec2-54-93-98-119.eu-central-1.compute.amazonaws.com. |16509 | 54.93.64.0/18 | AMAZON-02 | US | amazon.com | A100 ROW GmbH
5.9.136.60 | swissns1.atnet.gr. |24940 | 5.9.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
5.9.156.51 | mx2.inlife.ru. |24940 | 5.9.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
5.9.174.50 | server.stykas.gr. |24940 | 5.9.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
62.113.249.12 | s7b.naranjatec.com. |47447 | 62.113.192.0/18 | TTM | DE | 23media.eu | 23Media GmbH
62.116.182.44 | mail.kinderschutzbund-muenster.de. |15456 | 62.116.160.0/19 | INTERNETX | DE | customer-net.de | Internetx Datacenter Munich
62.117.1.57 | mx01.telecolumbus.net. |20880 | 62.117.0.0/19 | TELECOLUMBUS | DE | blue-cable.net | Tele Columbus AG
62.122.80.89 | mucimg02.unicreditgroup.eu. |16379 | 62.122.80.0/21 | UNICREDIT-AS-MUC | IT | unicredit.eu | UniCredit Business Integrated Solutions S.C.p.A.
62.138.116.25 |  |61157 | 62.138.116.0/24 | TGOS | DE | hosteurope.de | Host Europe GmbH
62.138.7.77 | astra4772.startdedicated.net. |8972 | 62.138.0.0/19 | PLUSSERVER | DE | hosteurope.de | Host Europe GmbH
62.141.35.130 | mail1.cyber24.de. |24961 | 62.141.32.0/20 | MYLOC | DE | robhost.de | Robert Klikics
62.146.106.40 | mx01.udag.de. |15598 | 62.146.0.0/16 | QSC-AG | DE | united-domains.de | united-domains AG
62.153.159.92 | www.t-online.de. |3320 | 62.153.0.0/16 | DTAG | DE | telekom.de | Deutsche Telekom AG
62.181.145.175 | relayh35.s-web.de. |15790 | 62.181.144.0/20 | FINANZINFORMATIK-AS | DE | f-i.de | Finanz Informatik GmbH & Co. KG
62.209.51.173 | mx07-0020bc01.pphosted.com. |52129 | 62.209.50.0/23 | PROOFPOINT-ASN | GB | proofpoint.com | Proofpoint Ltd.
62.209.51.58 | mx07-00143503.pphosted.com.; mx07-001d1401.pphosted.com. |52129 | 62.209.50.0/23 | PROOFPOINT-ASN | GB | proofpoint.com | Proofpoint Ltd.
62.209.51.70 | mx0a-00164201.pphosted.com.; mx07-00164201.pphosted.com. |52129 | 62.209.50.0/23 | PROOFPOINT-ASN | GB | proofpoint.com | Proofpoint Ltd.
62.245.148.19 | mailin4.rmx.de. |8767 | 62.245.128.0/17 | MNET | DE | retarus.de | Retarus Network Services GmbH
78.42.183.193 | HSI-KBW-078-042-183-193.hsi3.kabel-badenwuerttemberg.de. |29562 | 78.42.0.0/16 | KABELBW | DE | kabel-badenwuerttemberg.de | Kabel BW GmbH
78.46.121.144 | pro9.linuxpl.com. |24940 | 78.46.0.0/15 | HETZNER | DE | hetzner.de | Hetzner Online AG
78.46.192.117 | mail.rbgi.net. |24940 | 78.46.0.0/15 | HETZNER | DE | hetzner.de | Hetzner Online AG
78.46.77.19 | mail.advalvas.be. |24940 | 78.46.0.0/15 | HETZNER | DE | hetzner.de | Hetzner Online AG
78.46.8.240 | dedi1090.your-server.de. |24940 | 78.46.0.0/15 | HETZNER | DE | hetzner.de | Hetzner Online AG
78.47.186.85 | static.78-47-186-85.clients.your-server.de. |24940 | 78.46.0.0/15 | HETZNER | DE | hetzner.de | Hetzner Online AG - Virtualisierung
78.47.244.149 | static.149.244.47.78.clients.your-server.de. |24940 | 78.46.0.0/15 | HETZNER | DE | your-server.de | Sergey Mesyura
78.47.37.138 | quality.test-network.com. |24940 | 78.46.0.0/15 | HETZNER | DE | ashaman-caballus.de | lognetic networks GmbH
78.47.88.117 | mail.helgenberger.net. |24940 | 78.46.0.0/15 | HETZNER | DE | hetzner.de | Hetzner Online AG
78.47.8.88 | dedi2600.your-server.de. |24940 | 78.46.0.0/15 | HETZNER | DE | hetzner.de | Hetzner Online AG
80.147.132.151 | mail.baratti-gmbh.de. |3320 | 80.144.0.0/13 | DTAG | DE | telekom.de | Deutsche Telekom AG
80.149.113.204 | tcmail92.telekom.de. |3320 | 80.144.0.0/13 | DTAG | DE | t-systems.com | T-Systems Enterprise Services GmbH
80.154.209.171 | smtp2.gopa-group.com. |3320 | 80.152.0.0/14 | DTAG | DE | gopa-group.com | GOPA Ges. fuer Organisation Planung u. Ausbildung mbH
80.154.25.251 | mail.schoelly.de. |3320 | 80.152.0.0/14 | DTAG | DE | schoelly.de | Schoelly Fiberoptic
80.190.136.216 | web01.relay-server.net. |15598 | 80.190.128.0/19 | QSC-AG | DE | webnventure.at | eBuz Internetdienste GbR z. Hd. Herrn Kaufmann
80.237.132.180 | wp173.webpack.hosteurope.de. |20773 | 80.237.132.0/24 | HOSTEUROPE | DE | hosteurope.de | Hosteurope GmbH
80.237.132.19 | wp012.webpack.hosteurope.de. |20773 | 80.237.132.0/24 | HOSTEUROPE | DE | hosteurope.de | Hosteurope GmbH
80.237.132.200 | wp193.webpack.hosteurope.de. |20773 | 80.237.132.0/24 | HOSTEUROPE | DE | hosteurope.de | Hosteurope GmbH
80.237.132.54 | wp047.webpack.hosteurope.de. |20773 | 80.237.132.0/24 | HOSTEUROPE | DE | hosteurope.de | Hosteurope GmbH
80.237.138.5 | mx0.webpack.hosteurope.de. |20773 | 80.237.138.0/24 | HOSTEUROPE | DE | hosteurope.de | Hosteurope GmbH
80.241.211.195 | host195.bomm.ch. |51167 | 80.241.210.0/23 | CONTABO | DE | contabo.de | Contabo GmbH
80.241.214.181 | vmi95171.contabo.host. |51167 | 80.241.214.0/24 | CONTABO | DE | contabo.de | Contabo GmbH
80.241.59.144 | mx3.suomi24.heinlein-hosting.de. |199118 | 80.241.56.0/21 | HPLS | DE | heinlein-support.de | Heinlein- Professional Linux Support GmbH
80.67.16.124 | ns.namespace4you.de. |34011 | 80.67.16.0/20 | DOMAINFACTORY | DE | ispgateway.de | Domainfactory
80.67.16.8 | twilight.domainfactory.de. ; twilght.ispgateway.de. |34011 | 80.67.16.0/20 | DOMAINFACTORY | DE | ispgateway.de | Domainfactory
80.67.17.177 | dgws21s12da.ispgateway.de. |20773 | 80.67.17.0/24 | HOSTEUROPE | DE | domainfactory.de | domainfactory GmbH
80.67.17.219 | sudelfeld.ispgateway.de. |20773 | 80.67.17.0/24 | HOSTEUROPE | DE | domainfactory.de | domainfactory GmbH
80.67.18.126 | mxlb.ispgateway.de. |34011 | 80.67.16.0/20 | DOMAINFACTORY | DE | domainfactory.de | domainfactory GmbH
80.67.29.4 | smtprelaylb.ispgateway.de. |34011 | 80.67.16.0/20 | DOMAINFACTORY | DE | domainfactory.de | domainfactory GmbH
80.69.98.122 | mx4.unitybox.de. |6830 | 80.69.96.0/21 | LGI | AT | unitymedia.de | Unitymedia NRW GmbH
80.82.223.90 | world-wide2.de. |24961 | 80.82.208.0/20 | MYLOC | DE | nol-is.de | Norplex Communications
80.84.1.120 | mail.vfnet.de. |3209 | 80.84.0.0/20 | VODANET | DE | vodafone.com | Vodafone Deutschland GmbH
80.84.1.48 | mx4.vfnet.de. |3209 | 80.84.0.0/20 | VODANET | DE | vodafone.com | Vodafone Deutschland GmbH
80.86.94.20 | loft1179.startdedicated.de. |8972 | 80.86.80.0/20 | PLUSSERVER | DE | plusserver.de | PlusServer AG
81.14.243.99 | mx01.htp-tel.de.: mail.htp-tel.de. |13045 | 81.14.128.0/17 | HTP | DE | htp.net | htp GmbH
81.16.178.171 | mail.inwent.org. |42283 | 81.16.176.0/20 | ELABNET | DE | elabnet.de | Elaborated Networks GmbH
81.169.141.63 | ns1.mr-wolf.nl. |6724 | 81.169.128.0/20 | STRATO | DE | strato.de | Strato AG
81.169.145.148 | w94.rzone.de. |6724 | 81.169.144.0/22 | STRATO | DE | strato.de | Strato AG
81.169.145.156 | w9c.rzone.de. |6724 | 81.169.144.0/22 | STRATO | DE | strato.de | Strato AG
81.169.145.159 | w9f.rzone.de. |6724 | 81.169.144.0/22 | STRATO | DE | strato.de | Strato AG
81.169.145.98 | smtp.rzone.de. |6724 | 81.169.144.0/22 | STRATO | DE | strato.de | Strato AG
81.20.94.242 | mxpool.hostedoffice.ag. |25260 | 81.20.88.0/21 | QUALITYHOSTING | DE | qualityhosting.de | QualityHosting AG
81.88.40.26 | mx006.kontent.com. |24973 | 81.88.32.0/20 | KOMPLEX | DE | kontent.de | KONTENT GmbH
82.165.132.42 | s15401375.onlinehome-server.info. |8560 | 82.165.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
82.165.151.207 | homegames.co.uk. |8560 | 82.165.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
82.165.229.27 | login-geo-bs.1und1.de. |8560 | 82.165.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
82.165.230.14 | login-geo-ba.1und1.de. |8560 | 82.165.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
82.165.255.93 |  |8560 | 82.165.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
82.165.50.1 | gmxhome.de. |8560 | 82.165.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
82.197.131.128 |  |13237 | 82.197.128.0/19 | LAMBDANET | DE | runhosting.com | ATTRACTSOFT GMBH
82.207.175.50 |  |8881 | 82.207.128.0/17 | VERSATEL | DE | obone.de | OBone GmbH
82.211.10.13 | vps.pine3consulting.com. |31400 | 82.211.10.0/24 | ACCELERATED | DE | bezier.it | FlameNetworks - Enterprise Hosting Solutions
82.96.101.119 | mx-out1.premiumwebhoster.net. ; mailout119.premiumwebhoster.net. |29686 | 82.96.64.0/18 | PROBENETWORKS | DE | probe-networks.de | Probe Networks
82.98.86.175 | www175.sedoparking.com. |47846 | 82.98.86.0/24 | SEDO | DE | sedo.com | Sedo Domain Parking
83.243.48.78 | mldi0002in.rlp.de. |3320 | 83.243.48.0/22 | DTAG | DE | rlp.de | Landesbetrieb Daten und Information Rheinland-Pfalz
83.243.56.110 | eurodomain.de. |25504 | 83.243.56.0/21 | CRONON | DE | vautron.de | Vautron Rechenzentrum AG
83.243.58.138 | mailout.netbeat.de. |25504 | 83.243.56.0/21 | CRONON | DE | vautron.de | Vautron Rechenzentrum AG
83.246.65.100 | mx-gate100-haj2.antispameurope.com. |24679 | 83.246.64.0/18 | SSERV | DE | antispameurope.de | antispameurope GmbH
83.246.65.85 | hsmx01-hz2.antispameurope.com. |24679 | 83.246.64.0/18 | SSERV | DE | antispameurope.de | antispameurope GmbH
84.19.26.108 | server08.tldhost.de. |30962 | 84.19.0.0/19 | COMTRANCE | DE | comtrance.net | comtrance GmbH
84.23.254.54 | mailin.koeln.de. |34171 | 84.23.240.0/20 | INTERDOTNET-LIG | DE | de.inter.net | Inter.Net Germany
84.23.254.55 | service.inter.net. |34171 | 84.23.240.0/20 | INTERDOTNET-LIG | DE | de.inter.net | Inter.Net Germany
85.10.213.74 | dedi274.nur4.host-h.net. |24940 | 85.10.192.0/18 | HETZNER | DE | hetzner.de | Hetzner Online AG
85.114.145.31 | europa.wol.de. |24961 | 85.114.128.0/19 | MYLOC | DE | egomera.de | Norplex Communications
85.115.56.190 | cluster-b.mailcontrol.com. |44444 | 85.115.56.0/24 | FORCEPOINT-CLOUD-EME | EU | websense.com | Websense Hosted R&D Ltd.
85.115.58.190 | cluster-e.mailcontrol.com. |44444 | 85.115.58.0/24 | FORCEPOINT-CLOUD-EME | EU | websense.com | Websense Hosted R&D Ltd.
85.13.130.50 | dd5114.kasserver.com. |34788 | 85.13.130.0/24 | NMM | DE | all-inkl.com | Neue Medien Muennich GmbH
85.13.132.98 | dd8012.kasserver.com. |34788 | 85.13.132.0/24 | NMM | DE | all-inkl.com | Neue Medien Muennich GmbH
85.13.134.202 | dd12516.kasserver.com. |34788 | 85.13.134.0/24 | NMM | DE | all-inkl.com | Neue Medien Muennich GmbH
85.13.136.183 | dd15438.kasserver.com. |34788 | 85.13.136.0/24 | NMM | DE | all-inkl.com | Neue Medien Muennich GmbH
85.13.140.187 | dd20632.kasserver.com. |34788 | 85.13.140.0/24 | NMM | DE | all-inkl.com | Neue Medien Muennich GmbH
85.13.141.202 | dd21926.kasserver.com. |34788 | 85.13.141.0/24 | NMM | DE | all-inkl.com | Neue Medien Muennich GmbH
85.13.143.190 | dd24318.kasserver.com. |34788 | 85.13.143.0/24 | NMM | DE | all-inkl.com | Neue Medien Muennich GmbH
85.13.150.241 | dd33620.kasserver.com. |34788 | 85.13.150.0/24 | NMM | DE | all-inkl.com | Neue Medien Muennich GmbH
85.13.154.72 | dd37700.kasserver.com. |34788 | 85.13.154.0/24 | NMM | DE | all-inkl.com | Neue Medien Muennich GmbH
85.158.138.179 | mail169.messagelabs.com. |21345 | 85.158.138.0/24 | SYMANTEC | GB | symantec.com | Messagelabs Limited
85.158.176.111 | 85-158-176-111.cloud5-vm382.de-nserver.de. |34432 | 85.158.176.0/24 | PHH | DE | de-nserver.de | ProfiHost
85.195.107.149 |  |29066 | 85.195.64.0/18 | VELIANET | DE | velia.net | velia.net Internetdienste GmbH
85.214.141.224 | nikpour.com. |6724 | 85.214.0.0/15 | STRATO | DE | strato.de | Strato AG
85.214.254.231 | kruegers.tv. |6724 | 85.214.0.0/15 | STRATO | DE | strato.de | Strato AG
85.214.36.104 | secondary.ops.eusc.inter.net. |6724 | 85.214.0.0/15 | STRATO | DE | strato.de | Strato AG
85.214.36.61 |  |6724 | 85.214.0.0/15 | STRATO | DE | strato.de | Strato AG
85.214.42.8 | h2087526.stratoserver.net. |6724 | 85.214.0.0/15 | STRATO | DE | strato.de | Strato AG
85.214.59.127 | mail.krichenbauer.de. |6724 | 85.214.0.0/15 | STRATO | DE | strato.de | Strato AG
85.214.60.76 | primitive-visions.de. |6724 | 85.214.0.0/15 | STRATO | DE | strato.de | Strato AG
85.25.199.30 | orion1344.server4you.de. |8972 | 85.25.0.0/16 | PLUSSERVER | DE | plusserver.de | PlusServer AG
85.25.237.90 | mx31.antispamcloud.com. |8972 | 85.25.237.0/24 | PLUSSERVER | DE | plusserver.de | PlusServer AG
85.25.82.33 | box.1domain.at. |61157 | 85.25.82.0/24 | TGOS | DE | plusserver.de | PlusServer AG
87.106.142.81 | s15264827.onlinehome-server.info. |8560 | 87.106.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
87.106.190.169 |  |8560 | 87.106.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
87.106.212.80 | s15299100.onlinehome-server.info. |8560 | 87.106.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
87.106.246.20 | radicalhosters.net. |8560 | 87.106.0.0/16 | ONEANDONE | DE | 1and1.co.uk | 1&1 Internet AG
87.118.108.92 | server.no-spam.ws. |31103 | 87.118.64.0/18 | KEYWEB | DE | keyweb.de | Keyweb AG
87.118.126.195 | ns.km34824-02.keymachine.de. |31103 | 87.118.64.0/18 | KEYWEB | DE | keyweb.de | Keyweb AG
87.118.82.155 | notixx03.de. |31103 | 87.118.64.0/18 | KEYWEB | DE | keyweb.de | Keyweb AG
87.234.41.189 | Mail02.cseur.net. |20676 | 87.234.0.0/16 | QSC | DE | qsc.de | China Shipping Agency (Germany) GmbH
87.237.216.50 | mx3.adidas-group.com. |12337 | 87.237.216.0/23 | NORIS | DE | - | Adidas HQ
87.238.192.101 | sh2101.evanzo-server.de. |42730 | 87.238.192.0/21 | EVANZOAS | DE | evanzo-server.de | EVANZO e-commerce GmbH Infrastructure
87.238.192.106 | sh2106.evanzo-server.de. |42730 | 87.238.192.0/21 | EVANZOAS | DE | evanzo-server.de | EVANZO e-commerce GmbH Infrastructure
87.238.192.138 | sh2138.evanzo-server.de. |42730 | 87.238.192.0/21 | EVANZOAS | DE | evanzo-server.de | EVANZO e-commerce GmbH Infrastructure
88.198.231.15 | static.88-198-231-15.clients.your-server.de. |24940 | 88.198.0.0/16 | HETZNER | DE | your-server.de | DomainProfi GmbH
88.198.60.20 | ptr.nonegar.eu. |24940 | 88.198.0.0/16 | HETZNER | DE | hetzner.de | Hetzner Online AG
88.198.82.185 | mail.24k.ua. |24940 | 88.198.0.0/16 | HETZNER | DE | your-server.de | Filipino Web Services Inc
88.198.87.74 | virweb02.platinpower.com. |24940 | 88.198.0.0/16 | HETZNER | DE | platinpower.com | PlatinPower.com GmbH
88.80.222.79 | vps6092.alfahosting-vps.de. |20773 | 88.80.192.0/19 | HOSTEUROPE | DE | alfahosting.de | Alfahosting GmbH
88.99.123.191 | static.191.123.99.88.clients.your-server.de. |24940 | 88.99.0.0/16 | HETZNER | DE | zen.co.uk | Zen Internet Ltd
88.99.124.96 | static.96.124.99.88.clients.your-server.de. |24940 | 88.99.0.0/16 | HETZNER | DE | zen.co.uk | Zen Internet Ltd
88.99.124.97 | static.97.124.99.88.clients.your-server.de. |24940 | 88.99.0.0/16 | HETZNER | DE | zen.co.uk | Zen Internet Ltd
88.99.66.136 | webs04rdns1.websouls.net. |24940 | 88.99.0.0/16 | HETZNER | DE | zen.co.uk | Zen Internet Ltd
88.99.89.75 | static.75.89.99.88.clients.your-server.de. |24940 | 88.99.0.0/16 | HETZNER | DE | zen.co.uk | Zen Internet Ltd
89.163.152.62 |  |24961 | 89.163.128.0/17 | MYLOC | DE | united-gameserver.de | United Gameserver GmbH
89.163.241.9 |  |24961 | 89.163.128.0/17 | MYLOC | DE | united-gameserver.de | United Gameserver GmbH
89.1.8.141 | cc-mx1.netcologne.de. |8422 | 89.0.0.0/15 | NETCOLOGNE | DE | netcologne.de | NetCologne Infrastructure
89.1.8.143 | cc-mx3.netcologne.de. |8422 | 89.0.0.0/15 | NETCOLOGNE | DE | netcologne.de | NetCologne Infrastructure
89.1.8.144 | cc-mx4.netcologne.de. |8422 | 89.0.0.0/15 | NETCOLOGNE | DE | netcologne.de | NetCologne Infrastructure
89.245.133.5 | maildo.versatel.de. |8881 | 89.245.0.0/16 | VERSATEL | DE | versatel.de | Versatel Deutschland
89.31.139.30 | whois.udag.net. |15598 | 89.31.136.0/21 | QSC-AG | DE | united-domains.de | united-domains AG
89.31.143.1 |  |15598 | 89.31.136.0/21 | QSC-AG | DE | united-domains.de | united-domains AG
89.31.143.125 |  |15598 | 89.31.136.0/21 | QSC-AG | DE | united-domains.de | united-domains AG
91.195.240.92 | custip-1092.sedoparking.com. |47846 | 91.195.240.0/23 | SEDO | DE | sedo.com | Sedo GmbH
91.211.40.36 | kunden3.webserv-it.de. |3209 | 91.211.40.0/22 | VODANET | DE | webserv-it.de | Schwarze/Riedel Gbr
91.250.99.138 | server.braun-it.de. |20773 | 91.250.64.0/18 | HOSTEUROPE | DE | hosteurope.de | Host Europe GmbH
91.4.152.175 | p5B0498AF.dip0.t-ipconnect.de. |3320 | 91.0.0.0/10 | DTAG | DE | telekom.de | Deutsche Telekom AG
93.104.21.42 | ppp-93-104-21-42.dynamic.mnet-online.de. |8767 | 93.104.0.0/16 | MNET | DE | m-net.de | M-net Telekommunikations GmbH
93.184.128.152 | relay1m.it.nrw.de. |43066 | 93.184.128.0/24 | IT | DE | nrw.de | Information und Technik NRW
93.190.235.106 | whois.ispapi.net. |42652 | 93.190.232.0/21 | DELUNET | DE | 1api.net | 1api GmbH
94.100.132.100 | hsmx01.antispameurope.com. |25394 | 94.100.132.0/23 | MK-NETZDIENSTE | DE | antispameurope.de | Hornetsecurity GmbH
94.100.134.100 | mx-gate100-dus.antispameurope.com. |12676 | 94.100.134.0/24 | NCORE | DE | antispameurope.de | Hornetsecurity GmbH
94.102.210.88 | vserver2.1A-7664.antagus.de. |25504 | 94.102.208.0/20 | CRONON | DE | vautron.de | Vautron Rechenzentrum AG
94.199.88.69 | mailin2.rmx.de. |48328 | 94.199.88.0/22 | RETARUS | DE | retarus.de | retarus GmbH
94.199.90.79 | mailin3.rmx.de. |48328 | 94.199.88.0/22 | RETARUS | DE | retarus.de | retarus GmbH
95.100.46.254 | a95-100-46-254.deploy.akamaitechnologies.com. |1273 | 95.100.32.0/20 | CW | EU | akamai.com | Akamai Technologies
[eof]
```
![](https://i.imgur.com/XF44ulV.jpg)

![](https://i.imgur.com/MEALmlc.jpg)

![](https://i.imgur.com/6BA6A1W.jpg)

![](https://i.imgur.com/O3VEOyD.jpg)