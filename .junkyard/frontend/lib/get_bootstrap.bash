#!/bin/bash
# Bootstrap version - change this to upgrade
VERSION="5.3.3"

echo "Getting Bootstrap ${VERSION}"
curl -L https://github.com/twbs/bootstrap/releases/download/v${VERSION}/bootstrap-${VERSION}-dist.zip -o bootstrap-dist.zip
unzip -o bootstrap-dist.zip
rm -rf bootstrap
mv bootstrap-${VERSION}-dist bootstrap
rm bootstrap-dist.zip

echo "Done! Bootstrap ${VERSION} installed to ./bootstrap/"
