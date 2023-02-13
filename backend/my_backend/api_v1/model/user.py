import bcrypt
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


class UserInterface(Base, Crud):
    __tablename__ = 'userinterface'

    # internal columns
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(NCHAR(36), default = lambda: str(uuid1()))

    # required for table inheritance
    discriminator = Column('type', String(50))
    __mapper_args__ = {'polymorphic_on': discriminator}

    # normal columns
    name = Column(Text, nullable=False)
    email = Column(Text)
    password_hash = Column(Text)

    @classmethod
    def makeCRUD(cls):
        # Create
        class Cin(BaseModel):
            name: str
            email: str
            password: str
        cls.Cin=Cin

        class Cout(Cin):
            pass
        cls.Cout=Cout

        # Read
        class Rin(BaseModel):
            pass
        cls.Rin=Rin

        class Rout(BaseModel):
            uuid: str
            name: str
            email: str
        cls.Rout=Rout

        class ListRout(BaseModel):
            users: List[cls.Rout]
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

    # any relevant user stuff

    def set_password(self, pw):
        pwhash = bcrypt.hashpw(pw.encode('utf8'), bcrypt.gensalt())
        self.password_hash = pwhash.decode('utf8')

    def check_password(self, pw):
        if self.password_hash is not None:
            expected_hash = self.password_hash.encode('utf8')
            return bcrypt.checkpw(pw.encode('utf8'), expected_hash)
        return False


class AdminUser(UserInterface):
    __tablename__ = 'adminuser'
    id = Column(Integer, ForeignKey(UserInterface.id), primary_key=True)
    __mapper_args__ = {"polymorphic_identity": "AdminUser"}

    def getKind(self):
        return "admin"

class MasterUser(UserInterface):
    __tablename__ = 'masteruser'
    id = Column(Integer, ForeignKey(UserInterface.id), primary_key=True)
    __mapper_args__ = {"polymorphic_identity": "MasterUser"}

    def getKind(self):
        return "master"

class User(UserInterface):
    __tablename__ = 'user'
    id = Column(Integer, ForeignKey(UserInterface.id), primary_key=True)
    __mapper_args__ = {"polymorphic_identity": "User"}

    extradata = Column(Text) # let's test table inheritance!

    def getKind(self):
        return "normal"


# *** pydantic models ***

# generate & attach pydantic models as class members to the sqlalchemy classes:
#attachCRUDInOut(AdminUser)
#attachCRUDInOut(User)
#attachCRUDInOut(MasterUser)
# now there is User.Cin, User.Cout, etc.
# it's nice to keep the CRUD in out models in the same place
# here is a more explicit example:
"""
class User_ListRout(BaseModel):
    users: List[User.Rout]

User.ListRout = User_ListRout
"""

# *** Helper / shorthand functions ***

def hasAdmin(ses):
    return ses.query(AdminUser).count() > 0

