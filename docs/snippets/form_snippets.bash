#!/bin/bash

# # choose your python flavor
# exe="python"
exe="python3"

# # list here your example snippets
codes="example1.py example2.py requirements.txt example_with_comments.py" 

for i in $codes
do
    echo $i
    $exe pyeval.py -f $i > $i"_"
done
