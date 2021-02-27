function getRemainingArgs() {
    if (process.env.npm_config_argv) {
        const argv = JSON.parse(process.env.npm_config_argv);

        if (argv.remain && argv.remain.length > 0) {
            // npm correctly populates the .remain property
            return argv.remain;
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
            
            return original;
        }
    } else {
        return [];
    }
}

function getValue(name, remaining) {
    for (let i = 0; i < remaining.length; i++) {
        if (remaining[i].startsWith(name) && remaining[i][name.length] === '=') {
            return [name, '=', remaining[i].substr(name.length + 1)];
        } else if (remaining[i] === name) {
            if (i + 1 >= remaining.length) {
                return [name, ' ', ''];
            } else if (remaining[i + 1][0] === '-') {
                return [name, ' ', ''];
            } else {
                return [name, ' ', remaining[i + 1]];
            }
        }
    }
    return [name, ' ', undefined];
}

function splitArg(arg) {
    return arg.split(':');
}

module.exports = {
    getRemainingArgs,
    getValue,
    splitArg,
};
