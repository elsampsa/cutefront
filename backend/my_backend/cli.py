import argparse, configparser, os, sys, logging, re
import uvicorn
from my_backend import settings
from my_backend.tool import ConfigToDict, str2bool
from my_backend.db.migrate import revision, upgrade, admin, dumpUsers

path = os.path.abspath(__file__).split(os.path.sep)
path = os.path.sep + os.path.join(*(path[:-1]))
default_ini_file = os.path.join(path, "ini/model.ini")

def process_cl_args():
  
    parser = argparse.ArgumentParser(usage="""     
my_backend [options] command

    commands:

        db      db operations.  Chooses postgresql or litesql, based in the ini file
        run     runs the webserver
        
    options:

        --ini   ini configuration file.  Please use complete path.
                Default: {default_ini_file}

    options for run:

        --cors  server tells the frontend that it can request stuff from
                wherever it wants.  Enable only for development!

    user management options for postgresql:

        --root      attempts to change the postgresql root user `postgres`
                    password according the ini file, by running sudo command
                    on your host.

        --user      create `user` according to ini file into postgresql
                    if it doesn't exist.  Resets password for `user`        
                    according to `password` (see the ini file).

        --drop      drops all connections to the database

    db management options (for both postgres and sqlite):

        --init      removes the database if it exists, creates the database (again)
                    NOTE: remember to combine this with `--revision --upgrade`

        --revision  runs alembic migration & creates a new revision

        --upgrade   upgrades according to the latest alembic revision

        --admin     creates an app AdminUser according to the database schema
                    and sets `admin_user_password` according to the ini file.
                    If AdminUser exists, just changes the password

        --dump      dump all users to the terminal

    examples:

        my_backend db --root --user

                    initializes the postgresql database with correct
                    credentials (as described in the ini file)

        my_backend db --drop --init --revision --upgrade

                    creates tables for the first time, creates initial alembic
                    migration and upgrades (creates) sql tables

    """.format(default_ini_file=default_ini_file))
    parser.add_argument("command", action="store", type=str,                 
                        help="mandatory command")
    parser.add_argument("--nice", action="store", type=str2bool, required=False, default=False,
                        help="Be nice")
    parser.add_argument("--ini", action="store", type=str, required=False, default=default_ini_file,
                        help=".ini configuration file")
    parser.add_argument("--cors", action="store_true", help="server allows all CORS")
    parser.add_argument("--root", action="store_true", help="set postgresql master password")
    parser.add_argument("--user", action="store_true", help="create database user and set password")
    parser.add_argument("--init", action="store_true", help="remove database and recreate")
    parser.add_argument("--create", action="store_true", help="create database")
    parser.add_argument("--admin", action="store_true", help="create app admin user")
    parser.add_argument("--drop", action="store_true", help="drops all db connections")
    parser.add_argument("--revision", action="store_true", help="run alembic revision")
    parser.add_argument("--upgrade", action="store_true", help="upgrade tables")
    parser.add_argument("--dump", action="store_true", help="dump all users")

    parsed_args, unparsed_args = parser.parse_known_args()
    return parsed_args, unparsed_args


def main():
    parsed, unparsed = process_cl_args()
    assert(parsed.ini is not None), "please provide an .ini file"
    parsed.ini = os.path.abspath(parsed.ini)
    assert(os.path.exists(parsed.ini)), "can't find .ini file '"+str(parsed.ini)+"' sure you defined absolute path?"
   
    print("using ini file", parsed.ini)

    for arg in unparsed:
        print("Unknow option", arg)
        sys.exit(2)

    cfg = configparser.ConfigParser()
    cfg.read(parsed.ini)
    # settings via a global singleton
    settings.cfg = cfg

    #""" set loggers
    try:
        logging.config.fileConfig(cfg, disable_existing_loggers=True)
    except Exception as e:
        print("there was error reading your .ini file.  Please check your logger definitions")
        print("failed with:", e)
        raise(e)
    
    logger = logging.getLogger("main")
    if parsed.command == "run":
        # set this as an evironmetal var, 
        # so that the process spanned by uvicorn can find it
        # (it needs to set the singleton settings.cfg again)
        os.environ["FASTAPI_INI"]=parsed.ini
        os.environ["FASTAPI_CORS"]=str(parsed.cors)

        # pick the "[Uvicorn]" sectin from the ini file
        uv_cfg = cfg["Uvicorn"]

        dic = ConfigToDict(
            uv_cfg,
            host=(str, "0.0.0.0"),
            port=(int, 8000),
            reload=(bool, False),
            log_level=(str, None), # nopes
            debug=(bool, None),
            workers=(int, None),
            limit_concurrency=(int, None),
            limit_max_requests=(int, None)
        )
        dic["log_config"] = parsed.ini
        # dic["reload-dir"] = os.path.dirname(os.path.realpath(__file__)) # nopes

        # ASGI gateway
        # correct watch directory:
        os.chdir(os.path.dirname(os.path.realpath(__file__)))
        uvicorn.run(
            "my_backend.main:app", 
            **dic
            )

        """example
        # https://stackoverflow.com/questions/70300675/fastapi-uvicorn-run-always-create-3-instances-but-i-want-it-1-instance
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, log_level="debug", debug=True,
                    workers=1, limit_concurrency=1, limit_max_requests=1)
        """
        sys.exit(0)

    if parsed.command == "db":
        url = cfg["DEFAULT"]["sqlalchemy_url"]
        # switch command to possu or lite
        if re.compile("^postgresql").match(url) is not None:
            logger.info("It seems you have postgresql (aka possu)")
            dbtype = "possu"
        elif re.compile("^sqlite").match(url) is not None:
            logger.info("It seems you have sqlite")
            dbtype = "lite"
        else:
            logger.critical("It seems you have bad sqlalchemy_url in your ini file")
            sys.exit(2)
        
    if dbtype == "possu":
        url = cfg["DEFAULT"]["sqlalchemy_url"]
        if re.compile("^postgresql").match(url) is None:
            logger.critical("Your url '%s' does not seem fit for posgresql",
                url)
            sys.exit(2)
        from my_backend.db.possu import root, user, drop, init
        if parsed.root:
            root()
        if parsed.user:
            user()
        if parsed.drop:
            drop()
        if parsed.init:
            init(drop = True)
        if parsed.create:
            init(drop = False)
        if parsed.revision:
            revision(parsed.ini)
        if parsed.upgrade:
            upgrade(parsed.ini)
        if parsed.admin:
            admin()
        if parsed.dump:
            dumpUsers()
        sys.exit(0)

    if dbtype == "lite":
        url = cfg["DEFAULT"]["sqlalchemy_url"]
        if re.compile("^sqlite").match(url) is None:
            logger.critical("Your url '%s' does not seem fit for sqlite",
            url)
            sys.exit(2)
        from my_backend.db.lite import init
        if parsed.init:
            init()
        if parsed.revision:
            revision(parsed.ini)
        if parsed.upgrade:
            upgrade(parsed.ini)
        if parsed.admin:
            admin()
        if parsed.dump:
            dumpUsers()
        sys.exit(0)


if __name__ == "__main__":
    main()
