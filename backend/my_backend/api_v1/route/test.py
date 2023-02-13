import logging
from fastapi import APIRouter, Body, Depends, HTTPException
# from uuid import uuid4
from my_backend.singleton import cache
from my_backend.tool import make_token
from .auth import get_current_user
from my_backend.api_v1.model.user import UserInterface

from my_backend.settings import Session

router = APIRouter()

logger = logging.getLogger("test_route")

"""final route:

"/api_v1" [my_backend.api_v1.constant.API_STR] + "/test" [my_backend.api_v1.route.__init__] + "/testi" [here] = "/api_v1/test/testi"
"""
@router.get("/testi")
def read_root():
    logger.debug("returning hello world")
    return {"Hello": "World"}

from typing import Optional
from pydantic import BaseModel

from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class TestInput(BaseModel):
    param: int

class UserOutput(BaseModel):
    name: str
    email: str

@router.get("/read_auth")
def read_auth(param: TestInput):
    logger.debug("auth cookie test %i", param)


@router.get("/auth")
def read_auth(token: str = Depends(oauth2_scheme)):
    # this call will succeed if you have this header: "Authentication: Bearer token"
    logger.info("auth token is '%s'", token)


@router.get("/cache")
def cache_test():
    logger.info("cache now %s, will add a key", cache)
    token = make_token()
    cache[token] = "kokkelis"
    return cache


@router.get("/auth_data")
async def get_auth_data(param: TestInput, user_uuid = Depends(get_current_user)):
    return "you are authenticated!"

@router.get("/current_user_data")
async def get_auth_data(param: TestInput, user_uuid = Depends(get_current_user)) -> UserOutput:
    with Session(logger) as ses:
        query = ses.query(UserInterface).filter(UserInterface.uuid == user_uuid)
        user = query.first()
        if user is None:
            raise HTTPException(status_code=400, detail="Internal Server Error")
        # return {"name": user.name, "email": user.email}
        return UserOutput(name=user.name, email=user.email)
