# npm-remaining-args
Simplify use of remaining args in npm scripts

This package provides a simple command that can be used inside npm scripts to grab all the remaining arguments passed to `npm run`. These can then be inserted anywhere in the command, not just at the end.

# Install

```bash
$ npm install --save-dev npm-remaining-args
```

# Usage

Example `package.json`:

```json
{
    ...
    "scripts": {
        "start": "echo started && echo $(npm-remaining-args) && echo done && npm-no-args"
    }
    ...
}
```

Example invocation:

```bash
$ npm run start -- Hello World
start
Hello World
done
```
