const _data = require('./data');
const _menu = require('../index');

(async() => {
    const res = await new _menu(_data);
})()