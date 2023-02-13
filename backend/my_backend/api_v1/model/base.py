from uuid import uuid1
from sqlalchemy import Column, Integer, NCHAR, inspect
from pydantic import BaseModel, create_model
# from .meta import Base

class Crud:
    """A class that is used in "mixing" with an sqlalchemy Base class, like this:

    ::

        Base = declarative_base()
        ...

        class UserModel(Base, Crud):
            ...
    
    "attaches" "id" and "uuid" columns into ``UserModel``:
    """
    #id = Column(Integer, primary_key=True, index=True)
    #uuid = Column(NCHAR(36), default = lambda: str(uuid1()))
    """furthermore, some nice classmethods are "attached" to the composite class
    ``UserModel``, see below.
    """

    @classmethod
    def drop(cls, keys = [], model_name = "Model", base_model = BaseModel):
        """Helper function to create a pydantic model, from the sqlalchemy Base class
        by dropping some columns
        """
        assert(isinstance(keys, list))
        kwargs = {}

        mapper = inspect(cls)
        for column in mapper.attrs:
            key = column.key
            try:
                type_ = column.columns[0].type.python_type
            except AttributeError as e:
                print("drop: skipping", key)
                continue
            # print(">", cls, key, type_)
            kwargs[key] = (type_, ...)
        for key in keys:
            # print(">", key)
            if key in kwargs:
                # print("dropping", key)
                kwargs.pop(key)
        # print(">", kwargs)
        return create_model(
            # model_name,
            cls.__name__+"_"+model_name,
            **kwargs,
            __base__=base_model
        )

    @classmethod
    def retain(cls, keys = [], model_name = "Model", base_model = BaseModel):
        """Helper function to create a pydantic model, from the sqlalchemy Base class
        by keeping some columns
        """
        kwargs = {}
        mapper = inspect(cls)
        for column in mapper.attrs:
            key = column.key
            try:
                type_ = column.columns[0].type.python_type
            except AttributeError as e:
                print("retain: skipping", key)
                continue
            # print(">", key)
            if key in keys:
                kwargs[key] = (type_, ...)
        return create_model(
            cls.__name__+"_"+model_name,
            **kwargs,
            __base__=base_model
        )

    @classmethod
    def empty(cls, model_name = "Model", base_model = BaseModel):
        """Returns an empty model ..eh
        """
        return create_model(
            cls.__name__+"_"+model_name,
            __base__=base_model
        )


def colsFromPydantic(cls, pydantic_model):
    """cls is something derived from sqlalchemy Base class, as an example
    assume the class is ``UserModel``, then this function returns a list with:
    
    ::

        UserModel.name
        UserModel.surname
        ...

    In detail, it looks like this

    ::

        [
        <sqlalchemy.orm.attributes.InstrumentedAttribute at 0x7fd9a1685900>,
        <sqlalchemy.orm.attributes.InstrumentedAttribute at 0x7fd9a16859a0>,
        ...
        ]

    But if you do str() on any of the elements, you'll see "UserModel.name", or similar.
    That list can be turned into arg list with the * operator and passed to
    sqlalchemy's Session.query to pick up desired elements

    The list has all the elements that are defined in the pydantic model pydantic_model.

    That list can be then used in sqlaclhemy's session.query to 
    get only the desired elements as defined by the pydantic_model, for example:

    ::

        class Cout(BaseModel):
            uuid: str
            num: int
            name: str

        session.query(
            *(columnsFromPydantic(UserModel, Cout))
            ).all()

    will query the database only for uuid, num and name
    """
    lis = []
    try:
        keys = pydantic_model.schema()["required"]
    except KeyError:
        return lis
    for name in keys:
        lis.append(getattr(cls,name))
    return lis


