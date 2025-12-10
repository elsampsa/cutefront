#!/bin/bash
echo
echo Welcome to CuteFront project init script!
echo
echo Will create at current directory several subdirectories
echo and checkout the widget base library.
echo
echo Make sure you are inside a dedicated subdirectory for your project.
echo
read -p "Please enter app subdirectory [Default: app]: " name
name=${name:-app}  # If the user enters nothing, default to "app"
echo
mkdir $name
mkdir assets
mkdir css
git clone https://github.com/elsampsa/cutefront-lib.git 
mv cutefront-lib lib
