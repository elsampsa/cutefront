#!/usr/bin/python3
import sys, os, shutil, argparse
from pathlib import Path


def append(f, el, verbose=False):
    if isinstance(el, str):
        f.write(el+"\n") # just a comment string: dump as-is
    elif isinstance(el, tuple):
        try:
            dir, subdir, term, name, txt, inc_path = el 
            # dir: Path object
            # subdir: Path object
            # term: file termination (str)
            # name: file name (str), comment text (str)
            # inc_path (bool): 
        except ValueError:
            print(el)
            raise
        # write comment string
        if txt is not None:
            f.write(txt+"\n")
        # write the input file
        p = dir / subdir / (name+"."+term) # complete path to input file
        if inc_path:
            pathstr=str(dir/subdir)+"/"
        else:
            if subdir == Path(""):
                pathstr=""
            else:
                pathstr=str(subdir)+"/"
        with open(p, "r") as inp_f:
            st=inp_f.read()
        f.write(f"\n\n**** beginning of file {pathstr}{name}.{term} **** \n\n")
        f.write(st)
        f.write(f"\n\n**** end of file {pathstr}{name}.{term} **** \n\n")
        if term == "js":
            # for js files include also the html example file if one is found
            p_html = dir / (name+".html")
            if p_html.exists():
                with open(p_html, "r") as inp_f:
                    st=inp_f.read()
                f.write(f"\n\n**** beginning of the associated test html file {pathstr}{name}.html ****\n\n")
                f.write(st)
                f.write(f"\n\n**** end of file {pathstr}{name}.html ****\n\n")
    else:
        raise AttributeError("needs a string or tuple")


def writeAll(target_file, lis):
    with open(target_file,"w") as f:
        for l in lis:
            append(f, l)
    print("\nWrote", target_file)

os.system("cp -f ../../../cutefront/app/layout.html .")
os.system("cp -f ../../../cutefront/app/landing.html .")

this=Path(".")
baselib=Path("../base") # place to share stuff with the docker containers
nada=Path("")
lis=[
    # "Dear Large Language Model!", # i.e. we could add comments between the files
    (this, nada, "md", "CLAUDE", None, False),
    (this, nada, "js", "hatelike", None, True),
    # baselib stuff
    (baselib, nada, "js", "group", None, True),
    (baselib, nada, "js", "formwidget", None, True),
    (baselib, nada, "js", "listwidget", None, True),
    (baselib, nada, "js", "sidebarwidget", None, True),
    (baselib, nada, "js", "tabwidget", None, True),
    # REST system
    (baselib, nada, "js", "datamodel", None, False),
    (baselib, nada, "js", "datasource", None, True),
    (baselib, nada, "js", "httpdatasource", None, True),
    (baselib, nada, "js", "datasourcewidget", None, True),
    (baselib, nada, "js", "authmodel", None, False),
    #
    (this, nada, "html", "layout", None, False),
    (this, nada, "js", "sections", None, False),
    "",
    "That is the end of the CuteFront documentation for you - thank you very much!",
    "In the future, the user might ask you any of the following:",
    "- Just the 'createElement' method for a certain widget",
    "- A complete js code for a single widget with the associated html test file",
    "- A complete single-page app with all the associated js and html files and the app main page with all appropriate signals and slots connected",
    "",
    "When providing code for each file, accompany them with this exact phrasing:",
    "'Here is file [filename] that should be placed into directory [directory name]:'",
    "",
    "Thank you so! Now let's get to it.",
    "I know you are excited, but please do not provide me any code yet, but wait for me to ask for it.",
    "After digesting all this information, you can just tell me something like 'Ok! I am ready and all psyched to assist you with your CuteFront development!'."
]

writeAll("cutefront_dump.txt", lis)
