"""global singletons

you can set these in main.py by accessing them directly, i.e
singleton.var = something

from other modules, you need to use the getters, otherwise you'll get None
"""

"""in-memory cache for sessions 
.. if you'd have several backend instances running for load-balancing,
or want persistent cache, then use redis or the like, of course
"""
cache = {}

def getCache():
    return cache
