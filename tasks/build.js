const fs = require("fs-extra");

(async () => {
    try {
        await fs.copy('./src/index.html', './www/index.html');
        await fs.copy('./src/assets', './www/assets');
        console.log('done copying index.html to dist')
    } catch (err) {
        console.error(err)
    }
})()