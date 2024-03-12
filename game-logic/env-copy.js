const fs = require('fs');
const envPath = './.env';
fs.copyFile(envPath, './dist/.env', (err) => {
    if (err) throw err;
});