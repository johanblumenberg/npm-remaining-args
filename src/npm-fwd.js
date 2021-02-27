#!/usr/bin/env node

const common = require('./common');

const remaining = common.getRemainingArgs();

const args = process.argv.slice(1);
args.forEach(arg => {
    const [name, def] = common.splitArg(arg);
    const [, sep, value] = common.getValue(name, remaining);

    if (value !== undefined) {
        if (value === '' && sep === ' ') {
            console.log(name);
        } else {
            console.log(`${name}${sep}${value}`);
        }
    } else if (def) {
        console.log(`${name}${sep}${def}`);
    }
});
