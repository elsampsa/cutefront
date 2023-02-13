# CuteFront Frontend Framework

Nothing much in this file - please refer to the full documentation in here (TODO)

Frontend app files:
```
lib/                    the widget library, organized into subdirectories
app/                    YOUR application-specific .js and .html 
static/                 YOUR images etc.
css/                    YOUR css
bootstrap-5.2.3-dist/   bootstrap styling & javascripts.  Please use 
                        script "get_bootstrap.bash" to create this directory
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
get_bootstrap.bash      downoads bootstrap 5 for you
```
