import os, logging, glob
from my_backend import api
from my_backend.settings import getConfig

logger = logging.getLogger("main")

def revision(inifile, comment="yet another revision"):
    import alembic.config
    # let's go to [etc]/app/my_backend/api_v1
    path = os.path.abspath(api.__file__).split(os.path.sep)
    path = os.path.sep + os.path.join(*(path[:-1]))
    os.chdir(path)
    logger.warning("creating alembic revision")
    alembicArgs = [
        "-c", inifile,
        "revision","--autogenerate","-m",comment
    ]
    alembic.config.main(argv=alembicArgs)
    

def upgrade(inifile):
    import alembic.config
    # let's go to [etc]/app/my_backend/api_v1
    path = os.path.abspath(api.__file__).split(os.path.sep)
    path = os.path.sep + os.path.join(*(path[:-1]))
    os.chdir(path)
    logger.warning("upgrading database")
    alembicArgs = [
        "-c", inifile,
        'upgrade', 'head',
    ]
    alembic.config.main(argv=alembicArgs)


def clean():
    # let's go to [etc]/app/my_backend/api_v1
    path = os.path.abspath(api.__file__).split(os.path.sep)
    path = os.path.sep + os.path.join(*(path[:-1]))
    path = os.path.join(path,'alembic','versions','*.py')
    logger.warning("cleaning %s", path)
    for fname in glob.glob(path):
        os.remove(fname)


def admin():
    """assuming you have AdminUser in your models..
    """
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from my_backend.api_v1.model.user import AdminUser

    passwd = getConfig()["DEFAULT"]["admin_user_password"]
    email = getConfig()["DEFAULT"]["admin_user_email"]
    
    SQLALCHEMY_DATABASE_URL = getConfig()["DEFAULT"]["sqlalchemy_url"]

    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    with SessionLocal() as session:
        admin = session.query(AdminUser).first()
        if admin is None: # create
            logger.warning("creating AdminUser 'admin'")
            admin = AdminUser()
            admin.name = "admin"
            admin.email = email
            admin.set_password(passwd)
            session.add(admin)
        # set passwrd
        logger.warning("resetting 'admin's password & email")
        admin.set_password(passwd)
        admin.email = email
        session.commit()

def dumpUsers():
    """dump all users to the terminals
    """
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from my_backend.api_v1.model.user import UserInterface, AdminUser

    passwd = getConfig()["DEFAULT"]["admin_user_password"]
    SQLALCHEMY_DATABASE_URL = getConfig()["DEFAULT"]["sqlalchemy_url"]

    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    print("dumping users: class, name, email")
    with SessionLocal() as session:
        # admin = session.query(AdminUser).first()
        for user in session.query(UserInterface).all():
            print(user.__class__.__name__, user.name, user.email)
