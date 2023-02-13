import logging, configparser, secrets
from my_backend import settings

def ConfigToDict(cfg_, **kwargs):
    """Takes a configparser section, applies typecast and default values.

    Default value ``None`` indicates that if the key is not found in the configparser section, then
    the final dictionary will not have the element in question.

    For example:

    ::

        dic = ConfigToDict(
            uv_cfg,
            host=(str, "0.0.0.0"),
            port=(int, 8000),
            reload=(bool, False),
            log_level=(str, None),
            debug=(bool, None)
            )
        
    returns dict with keys "host", "port", but not "log_level" or "debug" if they are missing from the
    configparser object
    """
    out = {}
    for key, (type_, default_value) in kwargs.items():
        if key in cfg_: # cfg section has the required key from the input kwargs
            # print(key,"in config")
            out[key] = type_(cfg_[key])
        else:
            if default_value is None:
                pass
            else:
                out[key] = default_value
    return out

def loadConfig(inifile):
    cfg = configparser.ConfigParser()
    cfg.read(inifile)
    # settings via a global singleton
    settings.cfg = cfg

def make_token():
    """
    Creates a cryptographically-secure, URL-safe string
    """
    return secrets.token_urlsafe(16)

def orm2dict(obj):
    """Sql alchemy orm object to dictionary

    as per: https://stackoverflow.com/questions/1958219/how-to-convert-sqlalchemy-row-object-to-a-python-dict
    """
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

def str2bool(v):
    return v.strip().lower() in ("yes", "true", "t", "1")
