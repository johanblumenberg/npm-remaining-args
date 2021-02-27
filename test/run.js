const expect = require('expect');
const fs = require('fs-extra');
const path = require('path');
const cp = require('child_process');

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

    for (let cmd of ['npm']) {
        describe(cmd, () => {
            function execute(cmd) {
                const output = cp.execSync(cmd, {
                    cwd: testdir,
                }).toString();
                return output.split('\n').filter(l => !l.startsWith('> ')).filter(l => l.trim().length > 0);
            }

            function createPackage(pkg) {
                fs.writeJSONSync(path.join(testdir, 'package.json'), {
                    name: 'test-pkg',
                    version: '1.0.0',
                    description: 'test package',
                    license: 'UNLICENSED',
                    dependencies: {
                        "npm-remaining-args": process.cwd(),
                    },
                    ...pkg,
                });
                execute(`${cmd} install`);
            }
            
            it('npm-remaining-args should add remaining args', () => {
                createPackage({
                    scripts: {
                        cmd: 'echo started; echo $(npm-remaining-args) && echo done && npm-no-args'
                    }
                });
                const output = execute(`${cmd} run cmd -- hello world`);
                expect(output).toEqual(['started', 'hello world', 'done']);
            });
        });
    }
});
