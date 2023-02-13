import logging
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Body, Depends, HTTPException 

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from my_backend.api_v1.model.base import colsFromPydantic
from my_backend.api_v1.model.user import User, UserInterface
from my_backend.singleton import cache # a poor-mans in-memory key-value database: feel free to use something better, say, redis! :)
from my_backend.tool import make_token

from my_backend.settings import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# as per: https://fastapi.tiangolo.com/tutorial/security/simple-oauth2/

router = APIRouter()

logger = logging.getLogger("auth_route")

class HTTPError(BaseModel):
    detail: Optional[str]

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info("form_data: %s, %s", form_data.username, form_data.password)
    with Session(logger) as ses:
        query = ses.query(UserInterface).filter(UserInterface.name == form_data.username)
        many = False
        ok = False
        for user in query.all():
            if many:
                raise HTTPException(status_code=400, detail="Duplicate users in the database")
            logger.info("password hash: %s", user.password_hash)
            ok = user.check_password(form_data.password)
            logger.info("status %s", ok)
            if not ok:
                # user found but incorrect password .. clear token? warn logged-in user?
                pass
            many = True
        if not ok:
            raise HTTPException(status_code=400, detail="Incorrect username or password")
        # map token --> user uuid
        token = make_token()
        cache[token] = user.uuid
        # generate token & insert it into a memcache / database
    return {"access_token": token, "token_type": "bearer"}


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        uuid = cache[token]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return uuid

