# Capsop.com
Blog site for capsop.com driven by Jekyll.

## Install

Needs Ruby 3.1+ and Bundler.

	sudo apt-get install ruby-full build-essential
	gem install bundler

Then clone and build:

	git clone https://github.com/wirehack7/capsop.com.git
	cd capsop.com
	bundle install
	bundle exec jekyll build

The site is built into `_site`.

Live preview with rebuild on change:

	bundle exec jekyll serve

## Plugins

Managed via the `Gemfile` (`:jekyll_plugins` group):

	- jekyll-sitemap
	- jekyll-feed
	- jemoji         (GitHub-style :emoji:)
	- jekyll-mentions (@mentions)
