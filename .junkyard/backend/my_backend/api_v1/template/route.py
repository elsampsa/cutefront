import logging
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Body, Depends, HTTPException 
# e.g. raise HTTPException(status_code = NUM, detail = "some detail")
# https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
from my_backend.api_v1.model.base import colsFromPydantic
from my_backend.api_v1.model.device import Device
from my_backend.tool import orm2dict

from my_backend.settings import Session

router = APIRouter()

logger = logging.getLogger("main")

class HTTPError(BaseModel):
    detail: Optional[str]


"""final route:

"/api_v1" [my_backend.api_v1.constant.API_STR] 
+ "/device" [my_backend.api_v1.route.__init__] 
+ "/create" [here] = /api_v1/device/create
"""
@router.post("/create", response_model = Device.Cout)
def create(device: Device.Cin) -> Device.Cout:
    d = dict(device)
    logger.debug("device create got %s", d)
    device = Device(**d)
    with Session(logger) as ses:
        ses.add(device)


@router.get(
    "/read", 
    response_model = Device.ListRout,
    responses = {
        404: {"model": HTTPError}
    }
)
def read() -> Device.ListRout:
    """Return all Devices
    """
    logger.debug("device get")
    lis = []
    with Session(logger) as ses:
        # pick certain columns as defined in 
        # pydantic model Device.Rout for ses.query
        query = ses.query(*(colsFromPydantic(Device, Device.Rout)))
        # query.all() returns a list of Device objects
        # better to iterate directly the query: 
        for device in query:
            print(dict(device))
            lis.append(Device.Rout(**device))
    return Device.ListRout(devices=lis)


@router.put(
    "/update",
    responses = {
        422: {"model": HTTPError}
    }
)
def update(device_in: Device.Uin):
    with Session(logger) as ses:
        """query object that an "update" method
        but this does not work for inherited tables!
        https://stackoverflow.com/questions/44183500/problems-with-update-and-table-inheritance-with-sqlalchemy
        
        So, if you do _not_ have table inheritance, feel free to use directly:

        ::
        
            query.update(dict(device_in))

        """
        query = ses.query(Device).filter(Device.uuid == device_in.uuid)
        # delete & add
        device = query.first()
        if device is None:
            raise HTTPException(status_code = 422, detail = "no such Device")

        #""" # 1. the preferred method
        query.update(dict(device_in)) # the preferred method!
        #"""

        """ # 2. "manual" update
        for key, value in dict(device_in).items(): # update values
            setattr(device, key, value)
        """

        """ # 3. delete first & re-create (required for inherited tables)
        dic=orm2dict(device) # old data as dict
        dic.update(dict(device_in)) # update old data with new stuff
        new_device = Device(**dic)
        ses.delete(device)
        ses.add(new_device)
        """
            

@router.delete(
    "/delete",
    responses = {
        422: {"model": HTTPError}
    }
)
def delete(device: Device.Din):
    with Session(logger) as ses:
        device = ses.query(Device).filter(Device.uuid == device.uuid).first()
        if device is None:
            raise HTTPException(status_code = 422, detail = "no such Device")
        ses.delete(device)
