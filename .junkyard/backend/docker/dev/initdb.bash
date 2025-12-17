#!/bin/bash
## we're at /app
## code is edited live at "app/mount/"
cd /app/mount
## install backend - without dependencies: they have been installed at
## image creation
pip3 install --no-dependencies -e .
## drop connections, init the table & clear migrations, create tables again, create app admin user
my-backend db --drop --user --init --revision --upgrade --admin --ini=/app/secrets/common/dev.ini
