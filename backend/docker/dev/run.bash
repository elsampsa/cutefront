#!/bin/bash
## we're at /app
## code is edited live at "app/mount/"
cd /app/mount
## install backend - without dependencies: they have been installed at
## image creation
pip3 install --no-dependencies -e .
## auto-upgrade
my-backend db --drop --revision --upgrade --ini=/app/secrets/common/dev.ini
## run the app
my-backend run --ini=/app/secrets/common/dev.ini
