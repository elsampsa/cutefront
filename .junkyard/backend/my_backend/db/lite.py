import re, os, logging
from my_backend.db.migrate import clean
from my_backend.settings import getConfig

logger = logging.getLogger("main")

def init():
    """remove the sqlite file, remove alembic migrations

    sqlite://relative_path
    sqlite:///abs_path
    """
    url = getConfig()["DEFAULT"]["sqlalchemy_url"]
    r = re.compile("^sqlite:///")
    m = r.match(url)
    if m is None:
        raise(AssertionError("bad sqlalchemy_url"))
    filename=url[m.end():]
    if not os.path.isfile(filename):
        logger.warning("sqlalchemy_url does not point to an existing file: %s", filename)
    else:
        logger.warning("removing %s", filename)
        os.remove(filename)
    clean()
