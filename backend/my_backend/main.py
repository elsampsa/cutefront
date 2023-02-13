import os, configparser, logging
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from my_backend import settings
from my_backend.api_v1 import constant, router
from my_backend.session import SessionBase
from my_backend.tool import str2bool

inifile = os.environ["FASTAPI_INI"]
cors = os.environ["FASTAPI_CORS"]

cfg = configparser.ConfigParser()
cfg.read(inifile)

# set global singleton
settings.cfg = cfg

## set loggers.. not needed here (look at cli.py)
# logging.config.fileConfig(cfg, disable_existing_loggers=True)

# create a Session class
class SessionClass(SessionBase):
    sqlalchemy_url = cfg["DEFAULT"]["sqlalchemy_url"]
    to_http_exc = cfg["DEFAULT"]["exc_to_http_error"]

# set global singleton
settings.SessionClass = SessionClass

app = FastAPI(
    title=cfg["Project"]["projectname"], openapi_url=f"{constant.API_STR}/openapi.json"
)

allow_origins=[origin.strip() for origin in cfg["Cors"]["backend-origins"].split(",")]
if cors == "True":
    allow_origins.append("*")
    print("WARNING: DANGER: NO CORS LIMITATION")

# Set all CORS enabled origins
if str2bool(cfg["Cors"]["use-backend-origins"]):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(router, prefix=constant.API_STR)
