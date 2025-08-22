const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your name: ', (name) => {
    console.log(`Hello, ${name}!`);
    const text = name || ""
    const match = text.match(/^\/add\s+(.+)\s+(\d+)\s+(\d+)$/i);
    const item = match[1];
    const cost = parseInt(match[2], 10);
    let amount = 1;
    if (match[3]) {
        amount = parseInt(match[3], 10);
    } 
    const total_cost = cost * amount;
    
    console.log(item, cost, amount, total_cost)
    rl.close(); // Close the readline interface after getting input
});


