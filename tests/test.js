const _data = require('./data');
const _menu = require('../index');

(async() => {
    const actions = {
        progress_bar_test: async (data) => {
            console.log(data);
            const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
            progressBar.start(100, 0);

            let value = 0;
            await new Promise(resolve => {
                const interval = setInterval(() => {
                    value += 10;
                    progressBar.update(value);
                    if (value >= 100) {
                        clearInterval(interval);
                        progressBar.stop();
                        resolve();
                    }
                }, 800);
            });
            return true;
        }
    }
    new _menu(_data);
})()