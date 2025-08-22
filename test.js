const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your name: ', (name) => {
    console.log(`Hello, ${name}!`);
    if (name.startsWith("/add")) {
      const regex = /^\/add\s+(\S+)\s+(\d+)(?:\s+(\d+))?(?:\s+"([^"]+)")?$/;
      const match = name.match(regex);

      const item = match[1];
      const cost = parseInt(match[2], 10);
      const amount = match[3] ? parseInt(match[3], 10) : 1;
      const reason = match[4] || null;
      const total_cost = cost * amount;
      console.log(item, cost, amount, total_cost, reason)
    }
    
    rl.close(); // Close the readline interface after getting input
});


