const fs = require('fs');

const envPath = './.env';

fs.watchFile(envPath, (curr, prev) => {
    fs.copyFile(envPath, './dist/.env', (err) => {
        if (err) throw err;
        if (fs.existsSync('./dist/dummy.js')) {
            fs.unlinkSync('./dist/dummy.js');
        } else {
            fs.writeFileSync('./dist/dummy.js', '');
        }
        console.log('Copied .env to dist');
    });
});