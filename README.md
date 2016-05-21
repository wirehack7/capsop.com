# Capsop.com
Blog site for capsop.com driven by Jekyll.

## Install
On Debian styled machines run these commands to install Jekyll:

	sudo apt-get update
	sudo apt-get upgrade
	sudo apt-get install ruby-full
	gem install jekyll
	gem install bundler

Then clone this repository to your machine:

	git clone https://github.com/wirehack7/capsop.com.git

Build the website:

	cd capsop.com
	bundler install
	jekyll build

The site will be built into ```_site```

You can also serve it, so Jekyll notices changes:

	jekyll serve

Serve then via HTTP server ```_site``` or create a reverse proxy to the Jekyll port if you use the Jekyll webserver.

## Plugins

This site uses several plugins. Here is a list:

	- emoji_for_jekyll
	- jekyll-minifier
	- rssgenerator
	- archivepage