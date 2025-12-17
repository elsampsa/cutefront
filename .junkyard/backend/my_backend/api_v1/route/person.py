import logging
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Body, Depends, HTTPException 
# e.g. raise HTTPException(status_code = NUM, detail = "some detail")
# https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
from my_backend.api_v1.model.base import colsFromPydantic
from my_backend.api_v1.model.person import Person

from my_backend.settings import Session

router = APIRouter()

logger = logging.getLogger("main")

class HTTPError(BaseModel):
    detail: Optional[str]


"""final route:

"/api_v1" [my_backend.api_v1.constant.API_STR] 
+ "/person" [my_backend.api_v1.route.__init__] 
+ "/create" [here] = /api_v1/person/create
"""
@router.post("/create", response_model = Person.Cout)
def create(person: Person.Cin) -> Person.Cout:
    d = dict(person)
    # logger.debug("person create got %s", d)
    person = Person(**d)
    with Session(logger) as ses:
        ses.add(person)


@router.get(
    "/read", 
    response_model = Person.ListRout,
    responses = {
        404: {"model": HTTPError}
    }
)
def read() -> Person.ListRout:
    """Return all Persons
    """
    logger.debug("person get")
    lis = []
    with Session(logger) as ses:
        # pick certain columns as defined in 
        # pydantic model Person.Rout for ses.query
        query = ses.query(*(colsFromPydantic(Person, Person.Rout)))
        # query.all() returns a list of Person objects
        for person in query.all():
            print(dict(person))
            lis.append(Person.Rout(**person))
    return Person.ListRout(persons=lis)


@router.put(
    "/update",
    responses = {
        422: {"model": HTTPError}
    }
)
def update(person_in: Person.Uin):
    with Session(logger) as ses:
        """query object that an "update" method
        but this does not work for inherited tables!
        https://stackoverflow.com/questions/44183500/problems-with-update-and-table-inheritance-with-sqlalchemy
        
        So, if you do _not_ have table inheritance, feel free to use directly:

        ::
        
            query.update(dict(person))

        """
        # delete & add
        query = ses.query(Person).filter(Person.uuid == person_in.uuid)
        persons = query.all()
        if (len(persons) < 1):
            raise HTTPException(status_code = 422, detail = "no such Person")
        person = persons[0]
        ses.delete(person)
        person = Person(**(dict(person_in)))
        ses.add(person)
            

@router.delete(
    "/delete",
    responses = {
        422: {"model": HTTPError}
    }
)
def delete(person: Person.Din):
    with Session(logger) as ses:
        query = ses.query(Person).filter(Person.uuid == person.uuid)
        persons = query.all()
        if (len(persons) < 1):
            raise HTTPException(status_code = 422, detail = "no such Person")
        for person in persons:
            ses.delete(person)
