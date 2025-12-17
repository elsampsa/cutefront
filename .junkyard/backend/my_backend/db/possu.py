"""Postgres tools
"""
import os, glob, logging
from my_backend.settings import getConfig
# from my_backend import api
from my_backend.db.migrate import clean
import psycopg2
# from sqlalchemy.exc import OperationalError

possu_cfg = getConfig()["Postgres"]
logger = logging.getLogger("main")

def postgresSudo(command):
    st = 'sudo -u postgres psql -c "{command}"'.format(command=command)
    logger.debug(st)
    os.system(st)


def SQLExecute(
        comm, 
        user = "postgres",
        host = "localhost",
        port = 5432,
        dbname = "postgres",
        password = None):
    if password is None:
        con = psycopg2.connect(user=user, host=host, port = port, dbname = dbname)
    else:
        con = psycopg2.connect(user=user, host=host, port = port, password=password, dbname = dbname)
    con.autocommit = True
    cur = con.cursor()
    try:
        cur.execute(comm)
    except Exception as e:
        logger.critical("failed with %s", e)
    con.close()


def root():
    passwd=possu_cfg["root_password"]
    postgresSudo(
        "ALTER USER postgres WITH ENCRYPTED PASSWORD '{passwd}';".format(
            passwd=passwd
        )
    )

def user():
    host = possu_cfg["adr"]
    port = int(possu_cfg["port"])
    user = possu_cfg["user"]
    user_passwd = possu_cfg["password"]
    root_passwd = possu_cfg["root_password"]

    logger.warning("creating user '%s'", user)
    SQLExecute(
        "CREATE USER {user} WITH ENCRYPTED PASSWORD '{passwd}';".format(
            user = user, passwd = user_passwd),
        host = host,
        user = "postgres",
        port = port,
        password = root_passwd
    )

    logger.warning("resetting postgres password for user '%s'", user)
    SQLExecute(
        "ALTER USER {user} WITH ENCRYPTED PASSWORD '{passwd}';".format(
            user = user, passwd = user_passwd),
        host = host,
        user = "postgres",
        port = port,
        password = root_passwd
    )


def init(drop = False):
    """Create database for a certain user.

    :param drop: if True, the try to remove the database first


    When dropping database, it should be accompanied with:

    at ``backend/app/app/api_v1``:

    ::

        rm -rf alembic/versions/*
        alembic revision -m "init"
        alembic -c ../ini/model.ini upgrade head

    """
    db = possu_cfg["database_name"]
    host = possu_cfg["adr"]
    port = int(possu_cfg["port"])
    user = possu_cfg["user"]
    passwd = possu_cfg["root_password"]
    if drop:
        logger.warning("removing database %s", db)
        SQLExecute(
            "DROP DATABASE %s;" % (db),
            host = host,
            user = "postgres",
            port = port,
            password = passwd
        )

    logger.warning("creating database %s", db)
    SQLExecute(
        "CREATE DATABASE %s;" % (db),
        host = host,
        user = "postgres",
        port = port,
        password = passwd
    )
    logger.warning("granting all privileges to %s", user)
    SQLExecute(
        "GRANT ALL PRIVILEGES ON DATABASE {db} TO {user};".format(
            db = db, user=user
        ),
        host = host,
        user = "postgres",
        port = port,
        password = passwd
    )
    clean()

def drop():
    host = possu_cfg["adr"]
    db = possu_cfg["database_name"]
    port = int(possu_cfg["port"])
    root_passwd = possu_cfg["root_password"]

    logger.warning("dropping all db connections")
    SQLExecute(
        "select pg_terminate_backend(pid) from pg_stat_activity where datname='{db}';".format(
            db =db),
        host = host,
        user = "postgres",
        port = port,
        password = root_passwd
    )

