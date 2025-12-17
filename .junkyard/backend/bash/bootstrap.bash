#!/bin/bash
## install necessary software packages
sudo apt-get install python3-pip postgresql
## update pip to the latest version
pip3 install --user --upgrade pip
## complement the path to have $HOME/.local/bin 
## ..this is always not set correctly, especially in the edge-device distros
fname=$HOME"/.bashrc"
tmp="/tmp/bashrc"
add="export PATH=\$PATH:\$HOME/.local/bin # <my_tiny_backend>"
## remove my_tiny_backend specific stuff => tmpfile
grep -v "<my_tiny_backend>" $fname > $tmp
## tune .bashrc
echo $add | cat - $tmp > $fname
## systemd stuff!
mkdir -p $HOME/.config/systemd/user
# cp my_tiny_backend.service ~/.config/systemd/user/
## ..let the user do that (needs to be edited)
# # For systemd daemonization to work for non-root users, do:
sudo adduser $USER systemd-journal
sudo loginctl enable-linger $USER
