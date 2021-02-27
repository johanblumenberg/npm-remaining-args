#!/usr/bin/env node

if (process.env.npm_config_argv) {
    const argv = JSON.parse(process.env.npm_config_argv);

    if (argv.remain && argv.remain.length > 0) {
        // npm correctly populates the .remain property
        console.log(argv.remain.join(' '));
    } else if (argv.cooked && argv.original) {
        // yarn doesn't populate the .remain property
        // yarn allows command invocation as 'yarn run x' or just 'yarn x', but it still adds the 'run' part to the cooked
        const cooked = argv.cooked[0] == 'run' ? argv.cooked.slice(1) : argv.cooked;
        const original = argv.original[0] == 'run' ? argv.original.slice(1) : argv.original;

        while (cooked.length > 0 && cooked[0] === original[0]) {
            cooked.shift();
            original.shift();
        }

        if (original.length > 0 && original[0] == '--') {
            original.shift();
        }
        
        console.log(original.join(' '));
    }
}
