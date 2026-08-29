# Deployment

`git push` to `master` → GitHub Actions builds `ghcr.io/wirehack7/capsop.com:latest`
→ watchtower on the server pulls it within 5 min and restarts the site.

## Server setup (once)

```sh
scp deploy/compose.yaml server:/opt/capsop/compose.yaml
ssh server
cd /opt/capsop
docker compose up -d
```

Site is on `:8080` — point your existing TLS proxy at it.

### Private GHCR package

If the package isn't public, give watchtower a pull token:

```sh
echo $GHCR_PAT | docker login ghcr.io -u wirehack7 --password-stdin
```

then add to the `watchtower` service in compose.yaml:

```yaml
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ~/.docker/config.json:/config.json:ro
```

## Local

```sh
docker build -t capsop .
docker run --rm -p 8080:80 capsop
```
