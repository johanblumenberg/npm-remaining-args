#!/usr/bin/env node

const common = require('./common');

const remaining = common.getRemainingArgs();

const args = process.argv.slice(1);
args.forEach(arg => {
    const [name, def] = common.splitArg(arg);
    const [, , value] = common.getValue(name, remaining);

    if (value !== undefined) {
        console.log(value);
    } else if (def) {
        console.log(def);
    }
});
