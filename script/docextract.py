#!/usr/bin/python3
from pathlib import Path
import argparse
import os, sys, re, copy, glob
from pprint import pprint
from collections import OrderedDict
import yaml

def process_cl_args():
    comname = Path(sys.argv[0]).stem
    parser = argparse.ArgumentParser(
        usage=(
            # f'{comname} [options]\n'
            f'{comname}\n'
            '\n'
            'CuteFront autodoc extraction\n'
            ''
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
        # ..shows default values with -h arg
    )
    # parser.add_argument("command", action="store", type=str, help="mandatory command")
    parser.add_argument("--debug", action="store_true", help="debug verbosity on", 
        default=False)
    parser.add_argument("--input", action="store", help="Input js file.  Can be a file wildcard, i.e. *.js", required=True)
    parser.add_argument("--fmt", action="store", help="Output format: md, yaml or txt", required=False, default="md")
    parsed, unparsed = parser.parse_known_args()
    for arg in unparsed:
        print("Unknow option", arg)
        sys.exit(2)
    return parsed


def main():
    p = process_cl_args()
    # path = Path(p.input)
    # assert(path.exists()), "input file doesn't exist"
    assert (p.fmt in ["md", "yaml", "txt"]), "no such output format"
    
    # Regular expression pattern to extract content between /*//DOC and */:
    single_line_pattern = r'\/\*\/\/DOC\s*(.*?)\s*\*\/'
    # Regular expression pattern to extract content after /*//DOC
    multiline_pattern = r'\/\*\/\/DOC\s*(.*)'
    # Regular expression pattern to extract content before /*//DOC
    pattern = r'(.*)\/\*\/\/DOC'
    #
    # class_definition = "class ProfileWidget extends Widget"
    # Regular expression pattern to extract class names
    class_pattern = r'class\s+(\w+)\s+extends\s+(\w+)'
    signal_pattern = r'this\.signals\.(\w+)'
    slot_pattern = r'(\w+\(\w*\))\s*{'

    if p.fmt == "yaml":
        cl = dict
    else:
        cl = OrderedDict  

    record = cl()
    """{
        "class" : {
            "filename" : "filename",
            "superclass" : "superclass name"
            "doc" : [doc lines]
            "signals" : {
                "name" : [doc lines]
            }
            "slots" : {
                "name" : [doc lines]
                ...
            }
        }
    }
    """
    for path in glob.glob(p.input):
        if p.debug: print("\nFILE               >"+path)
        with open(path, "r") as f:
            ins=False
            for lineno, line_ in enumerate(f):
                line = line_[0:-1]
                if p.debug: print(line)
                if not ins and "/*//DOC" in line:
                    match = re.search(pattern, line)
                    if match:
                        content = match.group(1).strip()
                        if p.debug: print("CODE               >"+content+"<")
                        # is this class, signal or slot definition?
                        class_matches = re.search(class_pattern, content)
                        signal_matches = re.search(signal_pattern, content)
                        slot_matches = re.search(slot_pattern, content)
                        if class_matches:
                            class_ = class_matches.group(1)
                            superclass_name = class_matches.group(2)
                            #print("Subclass name:", class_)
                            #print("Superclass name:", superclass_name)
                            record[class_] = cl()
                            record[class_]["filename"] = path
                            record[class_]["superclass"] = superclass_name
                            record[class_]["doc"] = []
                            record[class_]["signals"] = cl()
                            record[class_]["slots"] = cl()
                            doclines = record[class_]["doc"] # set current doclines
                        elif signal_matches:
                            signal_name = signal_matches.group(1)
                            record[class_]["signals"][signal_name] = [] # comment lines here
                            doclines = record[class_]["signals"][signal_name] # set current doclines
                        elif slot_matches:
                            slot_name = slot_matches.group(1)
                            record[class_]["slots"][slot_name] = [] # comment lines here
                            doclines = record[class_]["slots"][slot_name] # set current doclines
                        else:
                            raise BaseException(f"Not class, signal or slot at line {lineno}")
                    else:
                        if p.debug: print("NO CODE MATCH FOUND>")
                        raise BaseException(f"Bad DOC match at line {lineno}")
                    if "*/" in line[-5:]: # this was a single line doc comment
                        if p.debug: print("SINGLE-LINE MATCH  >")
                        ins=False
                        match = re.search(single_line_pattern, line)
                        if match:
                            content = match.group(1).strip()
                            if p.debug: print("COMMENT            >"+content+"<")
                            doclines.append(content)
                        else:
                            if p.debug: print("NO MATCH FOUND     >")
                            raise BaseException(f"Bad single-line match at line {lineno}")
                    else: # start of a multi-line doc comment
                        ins=True
                        if p.debug: print("MULTILINE START    >")
                        match = re.search(multiline_pattern, line)
                        if match:
                            content = match.group(1).strip()
                            if p.debug: print("COMMENT            >"+content+"<")
                            if len(content) > 1:
                                doclines.append(content)
                        else:
                            if p.debug: print("NO MATCH FOUND     >")
                            raise BaseException(f"Bad multi-line start at line {lineno}")

                elif ins and "*/" in line:
                    if p.debug: print("MULTILINE END      >")
                    ins=False
                elif ins:
                    content = line.strip()
                    if p.debug: print("MULTILINE          >"+content+"<")
                    doclines.append(content)

    # pprint(record)
    if p.fmt == "yaml":
        yaml_string = yaml.dump(record)
        print(yaml_string)
    elif p.fmt == "md":
        st="\n    <br> "
        pre ="    <br> "
        for classname in record:
            print("### " + classname)
            doc=st.join(record[classname]["doc"])
            fname = record[classname]["filename"]
            superclass = record[classname]["superclass"]
            print("- file: `" + fname +"`")
            print("- inherits: `" + superclass +"`")
            print("- " + doc)
            for signal in record[classname]["signals"]:
                print("- SIGNAL: " + signal)
                doc = pre + st.join(record[classname]["signals"][signal])
                print(doc)
            for slot in record[classname]["slots"]:
                print("- SLOT: "+ slot)
                doc = pre + st.join(record[classname]["slots"][slot])
                print(doc)
            print()
    elif p.fmt == "txt":
        st="\n  "
        pre ="  "
        for classname in record:
            print(classname+":")
            doc=st.join(record[classname]["doc"])
            fname = record[classname]["filename"]
            superclass = record[classname]["superclass"]
            print("- file: `" + fname +"`")
            print("- inherits: `" + superclass +"`")
            print("- " + doc)
            for signal in record[classname]["signals"]:
                print("- signal " + signal)
                doc = pre + st.join(record[classname]["signals"][signal])
                print(doc)
            for slot in record[classname]["slots"]:
                print("- slot "+ slot)
                doc = pre + st.join(record[classname]["slots"][slot])
                print(doc)
            print()

if __name__ == "__main__":
    main()
