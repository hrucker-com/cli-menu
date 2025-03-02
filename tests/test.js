const _data = require('./data');
const _menu = require('../index');

(async() => {
    await new _menu(_data);
    console.log(`Menu closed`)
})()