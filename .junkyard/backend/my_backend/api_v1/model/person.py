from pydantic import BaseModel
from typing import List
from uuid import uuid1
from sqlalchemy import (
    Column,
    Integer,
    Text,
    String,
    Boolean,
    ForeignKey,
    NCHAR
)
# from sqlalchemy.orm import relationship
from .meta import Base
from .base import Crud

class Person(Base, Crud):
    __tablename__ = "person"
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(NCHAR(36), default = lambda: str(uuid1()))
    name = Column(String)
    surname = Column(String)
    email = Column(String)
    age = Column(Integer)
    address = Column(String)

    @classmethod
    def makeCRUD(cls):
        # Create
        class Cin(BaseModel):
            name: str
            surname: str
            email: str
            age: int
            address: str
        cls.Cin=Cin

        class Cout(Cin):
            pass
        cls.Cout=Cout

        # Read
        class Rin(BaseModel):
            pass
        cls.Rin=Rin

        class Rout(cls.Cin):
            uuid: str
        cls.Rout=Rout

        class ListRout(BaseModel):
            persons: List[cls.Rout]
        cls.ListRout=ListRout

        # Update
        class Uin(Cin):
            uuid: str
        cls.Uin=Uin

        class Uout(BaseModel):
            pass
        cls.Uout=Uout

        # Delete
        class Din(BaseModel):
            uuid: str
        cls.Din=Din

        class Dout(BaseModel):
            pass
        cls.Dout=Dout
