#!/bin/bash
# copy the cutefront widget library in-place
cp -rf ../frontend/lib .
rm lib/.git*
rm -rf lib/private
# copy the cutefront fullstack demo app in-place
cp -rf ../frontend/app .
cp -rf ../frontend/assets .
cp -rf ../frontend/css .
cp -rf ../frontend/app.html .
# TODO: copy more examples from other repos here
