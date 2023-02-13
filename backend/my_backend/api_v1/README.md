
## Creating a new CRUD data element

Running:
```
./newcrud.py Device
```

Will create:
```
model/device.py
route/device.py
../../notebook/device.ipynb
```

And modify correctly
```
route/__init__.py
model/__init__.py
```

That notebook created is nice for debugging your CRUD operations with the backend

After that you should start editing ``model/device.py`` for the schema you want

## Creating datasources for CuteFront

After getting your pydantic models straight, you can run:
```
./newfrontdata.py Device
```
And direct the output to the correct .js file in the frontend code.  Now you
have yourself CuteFront datasources, both for actual HTTP request for the backend
and for mock data



