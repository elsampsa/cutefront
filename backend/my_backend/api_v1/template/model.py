from pydantic import BaseModel
from typing import List
from uuid import uuid1
from sqlalchemy import (
    Column,
    Integer,
    Text,
    Float,
    String,
    Boolean,
    ForeignKey,
    NCHAR
)
# from sqlalchemy.orm import relationship
from .meta import Base
from .base import Crud

class Device(Base, Crud):
    """This class inherits from both sqlalchemy (Base) and from our custom class Crud
    (please see ./base.py).  
    """
    __tablename__ = "device"
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(NCHAR(36), default = lambda: str(uuid1()))
    your_custom_column = Column(String) # TODO

    @classmethod
    def makeCRUD(cls):
        """Define CRUD operations' expected input/output data structures here

        You can also keep the following code section in-sync with whatever
        other http-based etc. service you need
        """
        # Create
        class Cin(BaseModel):
            # TODO: FILL IN ALL INPUT DATA FOR
            # CREATING A NEW OBJECT
            your_custom_column: str

        class Cout(Cin):
            # reply from server after create operation: just nothing
            pass

        # Read
        class Rin(BaseModel):
            # input for server for read operation: nothing (in this example case, at least)
            pass

        class Rout(Cin):
            # TODO: FILL IN ALL OUTPUT DATA FOR
            # QUERYING AN OBJECT
            your_custom_column: str

        class ListRout(BaseModel):
            # server replies with a list of objects obeying the Rout schema:
            devices: List[Rout]

        # Update
        # etc..
        class Uin(Cin):
            uuid: str

        class Uout(BaseModel):
            pass

        # Delete
        class Din(BaseModel):
            uuid: str

        class Dout(BaseModel):
            pass

        # attach to class
        cls.Cin=Cin
        cls.Cout=Cout
        cls.Rin=Rin
        cls.Rout=Rout
        cls.ListRout=ListRout
        cls.Uin=Uin
        cls.Uout=Uout
        cls.Din=Din
        cls.Dout=Dout
