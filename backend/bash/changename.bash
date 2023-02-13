#!/bin/bash
if [ $# -ne 1 ]; then
  echo "Give a new name for your module"
  echo
  echo "For example: changename.bash my-tiny-backend"
  echo
  echo "Remember to lines '-' instead of underscores '_'"
  exit
fi
#
# changename.bash my-tiny-backend
# changes all occurrences of my-backend to my-tiny-backend
# and all ocurrences and directories from my_backend to my_tiny_backend
#
fr="my-backend"
to=$1
fr2="my_backend"
to2=$(python3 -c '
import sys
print(sys.argv[1].replace("-","_"))
' $to)
echo
echo "renaming all ocurrences of '"$fr"' to '"$to"'"
echo "and all ocurrences and directories & files from '"$fr2"' to '"$to2"'"
echo
echo "Are you sure?"
echo "Be sure that *this* script is not being modified..!"
read -n1 -r -p "Press q to quit, space to continue..." key
echo

# exit 2

if [ "$key" = '' ]; then
    find . -name "my_backend*" | xargs -I {} python3 -c '
import sys, os
fname=sys.argv[1]
fr=sys.argv[2]
to=sys.argv[3]
fname_new=fname.replace(fr, to) # i.e. replace filename my_backend_whatever to my_tiny_backend_whatever
print("renaming", fname, "to", fname_new)
os.rename(fname, fname_new)
    ' {} $fr2 $to2
    echo "running sed"
    find * -exec sed -i -r "s/$fr/$to/g" {} \;
    find * -exec sed -i -r "s/$fr2/$to2/g" {} \;
else
  echo
  echo "cancelled"
fi
