# path-nice

`path-nice` - How `path` and `fs` should be designed.

If sometimes you do not feel nice about `path` or `fs` of Node.js, then just

![Add nice here](./docs/images/add-nice-here.png)


All existing code still works, while the `path` evolves.

## Installation

```shell
npm install path-nice
# or
yarn add path-nice
```

- Requires: Node.js >= v12.0.0
- Provided: CommonJS, ESModule and TypeScript typings
- ESModule version can be [used directly in Node](https://nodejs.org/api/esm.html#modules-ecmascript-modules).

## Usage

### Real Case

This is the build script (`scripts/build.js`) of this library, which doesn't look nice (after all, we can't build it with itself) :

```js
const path = require('path');
const fs = require('fs');
const concurrently = require('concurrently');

const dirDist = path.resolve('./dist');

build();
async function build() {
    // clean
    fs.rmSync(dirDist, { recursive: true, force: true });

    // tsc concurrently
    const { result } = concurrently([
        'tsc -p tsconfig.cjs.json',
        'tsc -p tsconfig.esm.json',
    ]);
    await result;

    // cjs/esm fixup
    fs.writeFileSync(
        path.join(dirDist, 'cjs/package.json'),
        JSON.stringify({ type: 'commonjs' }, null, 4),
        { encoding: 'utf-8' },
    );
    fs.writeFileSync(
        path.join(dirDist, 'esm/package.json'),
        JSON.stringify({ type: 'module' }, null, 4),
        { encoding: 'utf-8' },
    );
}
```

Use `path-nice` instead:

```js
const path = require('path-nice');
const concurrently = require('concurrently');

const dirDist = path('./dist');

build();
async function build() {
    // clean
    await dirDist.remove();

    // tsc concurrently
    const { result } = concurrently([
        'tsc -p tsconfig.cjs.json',
        'tsc -p tsconfig.esm.json',
    ]);
    await result;

    // cjs/esm fixup
    await dirDist.join('cjs/package.json').writeJson({ type: 'commonjs' });
    await dirDist.join('esm/package.json').writeJson({ type: 'module' });
}
```