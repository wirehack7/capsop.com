# build the site
FROM ruby:3.3-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /site
COPY Gemfile Gemfile.loc[k] ./
RUN bundle install

COPY . .
RUN bundle exec jekyll build --trace

# serve it
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /site/_site /usr/share/nginx/html
