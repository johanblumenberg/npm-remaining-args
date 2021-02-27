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
        tempdir = fs.mkdtempSync('/tmp/npm-remaining-args-test-');
    });

    after(() => {
        fs.removeSync(tempdir);
    });

    beforeEach(() => {
        testdir = fs.mkdtempSync(path.join(tempdir, 'test-'));
    });

    afterEach(() => {
        fs.removeSync(testdir);
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

            it('npm-arg should pick a single arg', () => {
                createPackage({
                    scripts: {
                        cmd: 'echo started; echo $(npm-arg --my-first-arg) && echo done && npm-no-args'
                    }
                });
                const output = execute(target.runcmd('cmd', ['--my-first-arg', 'hello', '--my-second-arg', 'world']));
                expect(output).toEqual(['started', 'hello', 'done']);
            });

            it('npm-fwd should forward a single arg', () => {
                createPackage({
                    scripts: {
                        cmd: 'echo started; echo $(npm-fwd --my-first-arg) && echo done && npm-no-args'
                    }
                });
                const output = execute(target.runcmd('cmd', ['--my-first-arg', 'hello', '--my-second-arg', 'world']));
                expect(output).toEqual(['started', '--my-first-arg hello', 'done']);
            });

            it('npm-arg should pick a single arg given with equals sign', () => {
                createPackage({
                    scripts: {
                        cmd: 'echo started; echo $(npm-arg --my-first-arg) && echo done && npm-no-args'
                    }
                });
                const output = execute(target.runcmd('cmd', ['--my-first-arg=hello', '--my-second-arg', 'world']));
                expect(output).toEqual(['started', 'hello', 'done']);
            });

            it('npm-fwd should forward a single arg given with equals sign', () => {
                createPackage({
                    scripts: {
                        cmd: 'echo started; echo $(npm-fwd --my-first-arg) && echo done && npm-no-args'
                    }
                });
                const output = execute(target.runcmd('cmd', ['--my-first-arg=hello', '--my-second-arg', 'world']));
                expect(output).toEqual(['started', '--my-first-arg=hello', 'done']);
            });

            it('npm-arg should pick a single empty arg given with equals sign', () => {
                createPackage({
                    scripts: {
                        cmd: 'echo started; echo $(npm-arg --my-first-arg) && echo done && npm-no-args'
                    }
                });
                const output = execute(target.runcmd('cmd', ['--my-first-arg=', 'hello']));
                expect(output).toEqual(['started', 'done']);
            });

            it('npm-fwd should forward a single empty arg given with equals sign', () => {
                createPackage({
                    scripts: {
                        cmd: 'echo started; echo $(npm-fwd --my-first-arg) && echo done && npm-no-args'
                    }
                });
                const output = execute(target.runcmd('cmd', ['--my-first-arg=', 'hello']));
                expect(output).toEqual(['started', '--my-first-arg=', 'done']);
            });

            it('npm-arg should pick a single empty arg when next value starts with -', () => {
                createPackage({
                    scripts: {
                        cmd: 'echo started; echo $(npm-arg --my-first-arg) && echo done && npm-no-args'
                    }
                });
                const output = execute(target.runcmd('cmd', ['--my-first-arg', '--my-second-arg', 'world']));
                expect(output).toEqual(['started', 'done']);
            });

            it('npm-fwd should forward a single empty arg when next value starts with -', () => {
                createPackage({
                    scripts: {
                        cmd: 'echo started; echo $(npm-fwd --my-first-arg) && echo done && npm-no-args'
                    }
                });
                const output = execute(target.runcmd('cmd', ['--my-first-arg', '--my-second-arg', 'world']));
                expect(output).toEqual(['started', '--my-first-arg', 'done']);
            });

            describe('default values', () => {
                it('npm-arg should return a default arg', () => {
                    createPackage({
                        scripts: {
                            cmd: 'echo started; echo $(npm-arg --my-first-arg:default-value) && echo done && npm-no-args'
                        }
                    });
                    const output = execute(target.runcmd('cmd', ['--my-second-arg', 'world']));
                    expect(output).toEqual(['started', 'default-value', 'done']);
                });
    
                it('npm-fwd should forward a default arg', () => {
                    createPackage({
                        scripts: {
                            cmd: 'echo started; echo $(npm-fwd --my-first-arg:default-value) && echo done && npm-no-args'
                        }
                    });
                    const output = execute(target.runcmd('cmd', ['--my-second-arg', 'world']));
                    expect(output).toEqual(['started', '--my-first-arg default-value', 'done']);
                });

                it('npm-arg should not use the default value if an arg is given', () => {
                    createPackage({
                        scripts: {
                            cmd: 'echo started; echo $(npm-arg --my-first-arg:default-value) && echo done && npm-no-args'
                        }
                    });
                    const output = execute(target.runcmd('cmd', ['--my-first-arg', 'hello', '--my-second-arg', 'world']));
                    expect(output).toEqual(['started', 'hello', 'done']);
                });

                it('npm-fwd should fnot use the default value if an arg is given', () => {
                    createPackage({
                        scripts: {
                            cmd: 'echo started; echo $(npm-fwd --my-first-arg:default-value) && echo done && npm-no-args'
                        }
                    });
                    const output = execute(target.runcmd('cmd', ['--my-first-arg', 'hello', '--my-second-arg', 'world']));
                    expect(output).toEqual(['started', '--my-first-arg hello', 'done']);
                });

                it('npm-arg should not use the default value if an empty arg is given', () => {
                    createPackage({
                        scripts: {
                            cmd: 'echo started; echo $(npm-arg --my-first-arg:default-value) && echo done && npm-no-args'
                        }
                    });
                    const output = execute(target.runcmd('cmd', ['--my-first-arg', '--my-second-arg', 'world']));
                    expect(output).toEqual(['started', 'done']);
                });

                it('npm-fwd should fnot use the default value if an empty arg is given', () => {
                    createPackage({
                        scripts: {
                            cmd: 'echo started; echo $(npm-fwd --my-first-arg:default-value) && echo done && npm-no-args'
                        }
                    });
                    const output = execute(target.runcmd('cmd', ['--my-first-arg', '--my-second-arg', 'world']));
                    expect(output).toEqual(['started', '--my-first-arg', 'done']);
                });
            });
        });
    }
});
