#!/bin/python3
"""This script creates you a new CRUD model into model/ and route/.  It also appends the
__init__.py files and creates a testing notebook.
"""
import os, sys

if len(sys.argv) < 2:
    print("""
usage: ./newcrud.py ClassName

`ClassName` must be in singular (not plural), i.e. "CarDealer" instead of "CarDealers"
and have capital letters in order to distinguish it from object instances, i.e.
"CarDealer" instead of "cardealer".

for example:

    python3 newcrud.py CarDealer

would generate `model/cardealer.py`, `route/cardealer.py` and append `model/__init__.py` 
and `route/__init__.py` accordingly.  It also creates `cardealer.ipynb` into `../../notebook`.

""")
    sys.exit(2)

Classname = sys.argv[1] # CarDealer
assert(not Classname.islower()), "please use capital letters in ClassName"
instance_name = Classname.lower() # cardealer
instances_name = instance_name+"s" # cardealers

outfile = os.path.join("model",instance_name+".py")
if os.path.exists(outfile):
    # raise AssertionError("file " + outfile + " already exists")
    print("file " + outfile + " already exists")
else:
    print("creating", outfile)
    with open(outfile, 'w') as target:
        with open(os.path.join("template","model.py"), 'r') as f:
            for line in f:
                newline = line.replace("Device", Classname).\
                    replace("device", instance_name).\
                    replace("devices", instances_name)
                target.write(newline)        


outfile = os.path.join("route",instance_name+".py")
if os.path.exists(outfile):
    print("file " + outfile + " already exists")
else:
    print("creating", outfile)
    with open(outfile, 'w') as target:
        with open(os.path.join("template","route.py"), 'r') as f:
            for line in f:
                newline = line.replace("Device", Classname).\
                    replace("device", instance_name).\
                    replace("devices", instances_name)
                target.write(newline)        


routefile = os.path.join("route", "__init__.py")
print("appending", routefile)
with open(routefile, 'a') as f:
    line1 = "from . import " + instance_name
    line2 = 'router.include_router({instance_name}.router, prefix="/{instance_name}", tags=["{instance_name}"])'.format(
        instance_name = instance_name
    )
    f.write("\n")
    f.write(line1+"\n")
    f.write(line2+"\n")


# read __init__.py
initfile = os.path.join("model", "__init__.py")
print("reading", initfile)
with open(initfile,'r') as f:
    lines=f.read().split("\n")

crudok=False
newlines=[]
for line in lines:
    if (not crudok) and ("makeCRUD" in line):
        newlines.append("from ." + instance_name +" import *")
        crudok=True
    newlines.append(line)
newlines.append(Classname+".makeCRUD()")
# print(newlines)

# write __init__.py
print("writing", initfile)
with open(initfile, 'w') as f:
    for line in newlines:
        f.write(line+"\n")

outfile = os.path.join("..","..","notebook",instance_name+".ipynb")
if os.path.exists(outfile):
    print("file " + outfile + " already exists")
else:
    print("creating", outfile)
    with open(outfile, 'w') as target:
        with open(os.path.join("template","nb.ipynb"), 'r') as f:
            for line in f:
                newline = line.replace("Device", Classname).\
                    replace("device", instance_name).\
                    replace("devices", instances_name)
                target.write(newline)        
