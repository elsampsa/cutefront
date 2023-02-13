import traceback
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException


class SessionMeta(type):
    def __new__(meta, name, bases, dct):
        cls=super(SessionMeta, meta).__new__(meta, name, bases, dct)
        if cls.sqlalchemy_url is None:
            return cls
        # attach stuff to the class we are creating
        cls.engine = create_engine(cls.sqlalchemy_url)
        cls.SessionMaker = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)
        return cls
        
    def __init__(cls, name, bases, dct):
        super(SessionMeta, cls).__init__(name, bases, dct)
        

def tb_string(exc_traceback):
    st = ""
    for line in traceback.format_tb(exc_traceback):
        st += line
    return st

class SessionBase(metaclass=SessionMeta):
    """https://docs.sqlalchemy.org/en/14/orm/session_transaction.html
    """
    sqlalchemy_url = None
    to_http_exc = False
    """class members engine and SessionMaker are attached to this class
    by the metaclass, i.e. when you do this:

    class MySession(SessionBase):
        sqlalchemy_url = "postgres://your_url"

    MySession will now have automagic class members "engine" and "SessionMaker"
    """
    def __init__(self, logger = None):
        self.logger = logger
        assert self.sqlalchemy_url is not None,\
            "You must subclass SessionBase with 'sqlalchemy_url' class member"
        self.session = self.SessionMaker()

    def __enter__(self):
        return self.session

    def __exit__(self, exc_type, exc_value, exc_traceback):
        # user-induced error
        if exc_type is not None:
            self.session.close()
            if exc_type is HTTPException: # https://www.starlette.io/exceptions/
                self.logger.warning("HTTP Expection --> %s", exc_value.detail)
                self.logger.warning("Traceback --> %s", tb_string(exc_traceback))
                return False # propagate expection
            if self.logger is not None:
                self.logger.critical("internal error:\n%s\n%s:%s\n", tb_string(exc_traceback), exc_type.__name__, exc_value)
                # print("traceback", tb_string(exc_traceback))
            # switch exception or just propagate?
            if self.to_http_exc:
                raise HTTPException(500, detail="internal error")
            else:
                return False # propagate

        # check if there is a database-induced error
        try: 
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            self.session.flush() # for resetting non-commited .add()
            self.session.close()
            if self.logger is not None:
                self.logger.critical("database error:\n%s\n%s:%s\n", tb_string(exc_traceback), exc_type.__name__, exc_value)
                # print("traceback", tb_string(exc_traceback))
            # switch exception or just propagate?
            if self.to_http_exc:
                raise HTTPException(500, detail="database error: "+str(e))
            else:
                return False # propagate
        else:
            self.session.close()

        return True # all good!

