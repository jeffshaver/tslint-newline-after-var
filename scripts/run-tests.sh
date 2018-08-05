# Run each directory of tests
for D in `find test/rules/newline-after-var -type d`
do
  npx tslint --test ${D}
done