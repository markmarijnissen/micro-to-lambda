# micro-to-lambda

Convert a [micro](https://github.com/zeit/micro) function to a lambda handler.

## Installation

```bash
npm install --save micro-to-lambda
```

## Usage

Given a micro function in `index.js`
```
module.exports = (req,res) => ({ time: new Date() })
```

Convert it to a lambda function in `handler.js`:
```
var microToLambda = require('micro-to-lambda');
var index = require('./index');
module.exports.time = microToLambda(index);
```
# micro-to-lambda
