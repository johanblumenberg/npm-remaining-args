const expect = require('expect');
const fs = require('fs-extra');
const path = require('path');
const cp = require('child_process');

class Target {
    constructor(cmd, run, dashes) {
        this.cmd = cmd;
        this.run = run;
        this.dashes = dashes;
    }

    title() {
        return this.runcmd(' ', [' ']);
    }

    install() {
        if (this.cmd === 'npm') {
            return `${this.cmd} install --no-package-lock`;
        } else {
            return `${this.cmd} install`;
        }
    }

    runcmd(cmd, args) {
        let result = this.cmd;
        if (this.run) result += ' run';
        result += ` ${cmd}`;
        if (args && args.length) {
            if (this.dashes) result += ' --';
            result += ' ';
            result += args.join(' ');
        }
        return result;
    }
}

const targets = [
    new Target('npm', true, true),
    new Target('yarn', false, false),
    new Target('yarn', true, false),
    new Target('yarn', false, true),
];

describe('npm-remaining-args', function() {
    this.timeout(5000);

    let tempdir;
    let testdir;

    before(() => {
        tempdir = fs.mkdtempSync('./temp-');
    });

    after(() => {
        fs.removeSync(tempdir);
    });

    beforeEach(() => {
        testdir = fs.mkdtempSync(path.join(tempdir, 'test-'));
    });

    for (let target of targets) {
        describe(target.title(), () => {

            function execute(cmd) {
                const output = cp.execSync(cmd, {
                    cwd: testdir,
                    env: {
                        PATH: process.env.PATH,
                    },
                }).toString();

                return output
                    .split('\n')
                    .filter(l => !l.startsWith('> '))
                    .filter(l => !l.startsWith('$ '))
                    .filter(l => !l.startsWith('yarn run v'))
                    .filter(l => !l.startsWith('Done in '))
                    .filter(l => l.trim().length > 0);
            }

            function createPackage(pkg) {
                fs.writeJSONSync(path.join(testdir, 'package.json'), {
                    name: 'test-pkg',
                    version: '1.0.0',
                    description: 'test package',
                    license: 'UNLICENSED',
                    repository: {},
                    dependencies: {
                        "npm-remaining-args": process.cwd(),
                    },
                    ...pkg,
                });
                execute(target.install());
            }
            
            it('npm-remaining-args should add remaining args', () => {
                createPackage({
                    scripts: {
                        cmd: 'echo started; echo $(npm-remaining-args) && echo done && npm-no-args'
                    }
                });
                const output = execute(target.runcmd('cmd', ['hello', 'world']));
                expect(output).toEqual(['started', 'hello world', 'done']);
            });
        });
    }
});
