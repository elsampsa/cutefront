# CuteFront Frontend Framework

Nothing much in this file - please refer to the full documentation in [here](https://elsampsa.github.io/cutefront/_build/html/index.html)

Frontend app files:
```
lib/                    *** A git submodule ***
                        the widget library, organized into subdirectories
    base/               widgets
    bootstrap-5.2.3-dist/ 
                        bootstrap styling & javascript
app/                    YOUR application-specific .js and .html 
static/                 YOUR images etc.
css/                    YOUR css
app.html                main entry point of YOUR app
test.html               backend intercom quicktest of YOUR app
```

Docker files:
```
docker/dev/nginx.conf   reverse proxy conf for docker-compose
                        included into the docker image
Dockerfile.dev          dev mode docker image recipe
                        used by docker-compose in the upper level
                        directory
```

Scripts
```
nginx.py                run nginx locally
```
