# npm-remaining-args

Simplify use of remaining args in npm scripts

This package provides a simple command that can be used inside npm scripts to grab all the remaining arguments passed to `npm run`. These can then be inserted anywhere in the command, not just at the end.

# Install

```bash
$ npm install --save-dev npm-remaining-args
```

```bash
$ yarn add --dev npm-remaining-args
```

# Usage

## Extract all remaining arguments

The `npm-remaining-args` command will print all the remaining arguments from the `npm` invocation.

```json
{
    ...
    "scripts": {
        "start": "echo started && echo $(npm-remaining-args) && echo done && npm-no-args"
    }
    ...
}
```

```bash
$ npm run start -- Hello World
first Hello World last
```

## Extract a single argument

The `npm-arg` command will extract a single named argument from the `npm` invocation.

```json
{
    ...
    "scripts": {
        "start": "echo first $(npm-arg --my-arg) last && npm-no-args"
    }
    ...
}
```

```bash
$ npm run start -- --arg1 x --my-arg "Hello World" --arg2 y
first Hello World last

$ npm run start -- --arg1 x --my-arg --arg2 y
first  last
```

## Single argument with default value

Adding a default value will print the default value if the argument is absent.

```json
{
    ...
    "scripts": {
        "start": "echo first $(npm-arg --my-arg:default-value) last && npm-no-args"
    }
    ...
}
```

```bash
$ npm run start -- --arg1 x --my-arg "Hello World" --arg2 y
first Hello World last

$ npm run start -- --arg1 x --arg2 y
first default-value last

$ npm run start -- --arg1 x --my-arg --arg2 y
first  last
```

## Forward a single argument

The `npm-fwd` command will forward a single named argument from the `npm` invocation. This is basically a shortcut for `--my-arg $(npm-arg --my-arg)`, except that it handles missing values and default values.

```json
{
    ...
    "scripts": {
        "start": "echo first $(npm-fwd --my-arg) last && npm-no-args"
    }
    ...
}
```

```bash
$ npm run start -- --arg1 x --my-arg "Hello World" --arg2 y
first --my-arg Hello World last

$ npm run start -- --arg1 x --arg2 y
first  last
```

## Forward default values

```json
{
    ...
    "scripts": {
        "start": "echo first $(npm-fwd --my-arg:default-value) last && npm-no-args"
    }
    ...
}
```

```bash
$ npm run start -- --arg1 x --my-arg "Hello World" --arg2 y
first --my-arg Hello World last

$ npm run start -- --arg1 x --arg2 y
first --my-arg default-value last

$ npm run start -- --arg1 x --my-arg --arg2 y
first --my-arg last
```
