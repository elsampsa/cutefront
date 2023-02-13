# A FastAPI Backend

*A simple FastAPI backend with ini files as the only parametrization / source of truth*

## A. Running with docker-compose

Please refer to the upper-level directory

## B. Running natively

### 1. Install

By default you are going to use sqlite, so you only need to do this:
```
sudo apt-get install sqlite3
```

If you are going to run this with systemd service or with postgresql, please run first [bash/bootstrap.bash](bash/bootstrap.bash). 

You may want to read that file & reflect on it a bit.  Remove parts you don't need, for example the installation of postgresql.

If you use postgresql, check that it is running with:
```
sudo systemctl status postgresql
```

For isolated installation you might first want to do this:
```
virtualenv -p python3 venv
source venv/bin/activate
```

Install this python package (my-backend) with:
```
pip3 install --user -e .
```

Now you should have the command ``my-backend`` installed in your system.

### 2. Choose sqlite or postgresql

The ``my-backend`` command (see below) uses as a default ``ini`` file [my_backend/ini/model.ini](my_backend/ini/model.ini), that defaults
to sqlite.  You can change the database to posgresql my creating your own copy of that file & changing the sqlalchemy
database url as instructed therein.

You can use the ``my-backend`` with the ini file of your choice by adding the argument
```
--ini /complete/path/to/your/config.ini 
```
to the commands discussed below

### 3. Init sqlite

Init database with:
```
my-backend db --drop --init --revision --upgrade
```

### 4. Init postgresql

If you're using postgresql, do first this:
```
my-backend db --root --user
```

Create tables to your postgresql database with:
```
my-backend db --drop --init --revision --upgrade
```

### 5. Run

Run with:
```
my-backend run --cors
```

Now you can see the API endpoints in [http://0.0.0.0:8080/docs](http://0.0.0.0:8080/docs)


## C. Daemonize with systemd

To install the daemon into systemd, first copy 
[my_backend.service](my_backend.service) to ``$HOME/.config/systemd/user/`` 
(check that it is _not_ in ``/etc/systemd/user/``).

Remember to edit that file and set the correct ini file location!

Give this command:
```
systemctl --user enable my_backend.service
```

Start the daemon with
```
systemctl --user start my_backend.service
```
After that, it should start automatigally always when the device is booted

For checking the status, use:
```
systemctl --user start my_backend.service
```

To stop the daemon, type:
```
systemctl --user stop my_backend.service
```

To remove the daemon from the system, use:
```
systemctl --user disable my_backend.service
```

For accessing daemon's logging, use:
```
journalctl --user-unit my_backend.service
```

Type ``man journalctl`` to find out all the rich formatting & time filtering properties of the command ``journalctl``.

## D. Development notes

If you need to migrate your db, do this:
```
my-backend db --drop --revision --upgrade
```

If you need to remove the database and re-create the tables, do this:
```
my-backend db --drop --init --revision --upgrade
```

For quick-testing your backend, use [notebook/](notebook/)

For creating a new CRUD element, please use [my_backend/api_v1/newcrud.py](my_backend/api_v1/newcrud.py)

For creating CuteFront compatible data sources, please use [my_backend/api_v1/newfrontdata.py](my_backend/api_v1/newfrontdata.py)

If you want to re-name ``my-backend`` to something else, you can try this:
```
bash/changename.bash
```
Comes with absolutely no warrant!

## E. License & Copyright

Please see upper level directory


