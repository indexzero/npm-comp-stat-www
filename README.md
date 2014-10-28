# npm-comp-stat-www

The web view for a comprehensive set of analysis information for npm packages and authors / domain experts.

![](https://cldup.com/QRO1saFYqc.png)
![](https://cldup.com/Pl6jxjFi1C-3000x3000.png)

## Usage

In order to run the web server you'll need to generate the [codependencies] and [static-stats] for the package you want to view

```
# Install npm-comp-stat-www
cd path/to/npm-comp-stat-www
npm install

# Generate the codependencies graph
./node_modules/bin/npm-codependencies -r https://skimdb.nodejitsu.com -p $PACKAGE_NAME
mv "$PACKAGE_NAME.json" public/json/codeps/

# Generate the static analysis statistics
./node_modules/bin/npm-static-stats -r http://skimdb.nodejitsu.com -p $PACKAGE_NAME
mv "$PACKAGE_NAME.json" public/json/static-stats/

# Run the server and open the page for $PACKAGE_NAME
./bin/server
open http://localhost:8080/?p=$PACKAGE_NAME
```

##### License: MIT
##### Author: [Charlie Robbins](https://github.com/indexzero)
##### Contributors: [Jane Kim](https://github.com/janecakemaster)

[codependencies]: https://github.com/indexzero/npm-codepedencies
[static-stats]: https://github.com/indexzero/npm-static-stats