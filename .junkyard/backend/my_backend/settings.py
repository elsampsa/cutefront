"""a global singletons for settings

you can set these in main.py by accessing them directly, i.e.
settings.cfg = etc

from other modules, you need to use the getters, otherwise you'll get None
"""
cfg = None # override with configparser.ConfigParser() object in main.py
SessionClass = None # set'ted at main.py

"""For accessing, use these getters!
"""
def Session(*args, **kwargs):
    return SessionClass(*args, **kwargs)

def getConfig():
    return cfg
