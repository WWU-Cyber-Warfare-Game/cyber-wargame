const readline = require('node:readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("============================= WARNING =============================");
console.log("Auto-reload will cause a new game logic process to be spawned on every reload.");
console.log("Run Strapi without auto-reload using `npm run start`.");
rl.question("Do you want to continue anyway? (y/n): ", (answer) => {
    if (answer.charAt(0) == "y") {
        process.exit(0);
    } else {
        process.exit(1);
    }
});