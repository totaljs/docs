mkdir -p .bundle/

cd .bundle
mkdir resources
cp -a ../controllers/ controllers
cp -a ../definitions/ definitions
cp -a ../modules/ modules
cp -a ../schemas/ schemas
cp -a ../public/ public
cp -a ../views/ views
cp -a ../resources/default.resource resources/default.resource
total4 --bundle ../app.bundle
cd ..
rm -rf .bundle
echo "DONE"