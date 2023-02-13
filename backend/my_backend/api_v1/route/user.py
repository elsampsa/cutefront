import logging
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Body, Depends, HTTPException 
# e.g. raise HTTPException(status_code = NUM, detail = "some detail")
from my_backend.api_v1.model.base import colsFromPydantic
from my_backend.api_v1.model.user import User

from my_backend.settings import Session

router = APIRouter()

logger = logging.getLogger("user_route")

class HTTPError(BaseModel):
    detail: Optional[str]

"""final route:

"/api_v1" [my_backend.api_v1.constant.API_STR] + "/user" [my_backend.api_v1.route.__init__] + "/create" [here] = "/api_v1/user/create"
"""
@router.post("/create", response_model = User.Cout)
def create(user: User.Cin) -> User.Cout:
    d = dict(user)
    # logger.debug("create got %s", d)
    user = User(**d)
    with Session(logger) as ses:
        ses.add(user)


@router.get("/read", response_model = User.ListRout)
def read() -> User.ListRout:
    """Return all users
    """
    logger.debug("get")
    lis = []
    with Session(logger) as ses:
        # pick certain columns as defined in 
        # pydantic model User.Rout for ses.query
        query = ses.query(*(colsFromPydantic(User, User.Rout)))
        # query.all() returns a list of User objects
        for user in query.all():
            lis.append(User.Rout(**user))
    return User.ListRout(users=lis)


@router.put(
    "/update",
    responses = {
        422: {"model": HTTPError}
    }
)
def update(user_in: User.Uin):
    with Session(logger) as ses:
        query = ses.query(User).filter(User.uuid == user_in.uuid)
        """query object that an "update" method
        but this does not work for inherited tables!
        https://stackoverflow.com/questions/44183500/problems-with-update-and-table-inheritance-with-sqlalchemy
        
        So, if you do _not_ have table inheritance, feel free to use directly:

        ::
        
            query.update(dict(user_in))

        """
        # delete & add
        query = ses.query(User).filter(User.uuid == user_in.uuid)
        user = query.first()
        if user is None:
            raise HTTPException(status_code = 422, detail = "no such user")
        dic=orm2dict(user) # old data as dict
        dic.update(dict(user_in)) # update old data with new stuff
        new_user = User(**dic)
        ses.delete(user)
        ses.add(new_user)
            

@router.delete(
    "/delete",
    responses = {
        422: {"model": HTTPError}
    }
)
def delete(user_in: User.Din):
    with Session(logger) as ses:
        query = ses.query(User).filter(User.uuid == user_in.uuid)
        users = query.all()
        if (len(users) < 1):
            raise HTTPException(status_code = 422, detail = "no such user")
        for user in users:
            ses.delete(user)


