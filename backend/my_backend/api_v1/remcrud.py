#!/bin/python3
"""This script removes CRUD model created with newcrud.py from model/ and route/.  
It removes it from the __init__.py files and the corresponding testing notebook.
"""
import os, sys

if len(sys.argv) < 2:
    print("""
usage: python3 remcrud.py ClassName

`ClassName` must be in singular (not plural), i.e. "CarDealer" instead of "CarDealers"
and have capital letters in order to distinguish it from object instances, i.e.
"CarDealer" instead of "cardealer".

for example:

    python3 newcrud.py CarDealer

would remove `model/cardealer.py`, `route/cardealer.py` and clean `model/__init__.py` 
and `route/__init__.py` accordingly.  It also removes `cardealer.ipynb` from `../../notebook`.

""")
    sys.exit(2)

Classname = sys.argv[1] # CarDealer
assert(not Classname.islower()), "please use capital letters in ClassName"
instance_name = Classname.lower() # cardealer
instances_name = instance_name+"s" # cardealers

outfile = os.path.join("model",instance_name+".py")
input("remove "+outfile+" ? (press CTRL-C to abort)")
print("removing", outfile)
if os.path.exists(outfile):
    os.remove(outfile)
lines=[]
with open(os.path.join("model","__init__.py"), 'r') as f:
    for line in f:
        if line.find("from ."+instance_name+" import *") > -1:
            continue
        if line.find(Classname+".makeCRUD()") > -1:
            continue
        lines.append(line)
# print(lines)
#"""
with open(os.path.join("model","__init__.py"), 'w') as f:
    for line in lines:
        f.write(line)
#"""

outfile = os.path.join("route",instance_name+".py")
input("remove "+outfile+" ?")
print("removing", outfile)
if os.path.exists(outfile):
    os.remove(outfile)
lines=[]
with open(os.path.join("route","__init__.py"), 'r') as f:
    for line in f:
        if line.find("from . import "+instance_name) > -1:
            pass
        elif line.find("router.include_router("+instance_name+".router,") > -1:
            pass
        else:
            lines.append(line)
#print(lines)
#"""
with open(os.path.join("route","__init__.py"), 'w') as f:
    for line in lines:
        f.write(line)
#"""
outfile = os.path.join("..","..","notebook",instance_name+".ipynb")
input("remove "+outfile+" ?")
print("removing", outfile)
if os.path.exists(outfile):
    os.remove(outfile)
