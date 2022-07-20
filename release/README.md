# path-nice

[![npm version](https://img.shields.io/npm/v/path-nice)](https://www.npmjs.com/package/path-nice) ![license-MIT](https://img.shields.io/badge/license-MIT-green.svg) ![npm-bundle-size](https://img.shields.io/bundlephobia/minzip/path-nice) ![coverage](https://raw.githubusercontent.com/FuuuOverclocking/path-nice/main/docs/images/coverage.svg)

English | [简体中文](README-cn.md)

`path-nice` - The elegant and handy alternative to `path`, `fs` and `glob`

If sometimes you do not feel nice about the original `path` or `fs` of Node.js, then just

<img src="https://raw.githubusercontent.com/FuuuOverclocking/path-nice/main/docs/images/add-nice-here.png" width="500" />

All existing code still works, while the `path` evolves.

## Why this lib?

### One lib does work for two, simplifies the code greatly

Original ver:

```ts
import path from 'path';
import fs from 'fs';

const app = await fs.promises.realpath('./app');
const publicDir = path.join(app, 'public');
await fs.promises.writeFile(
    path.join(publicDir, 'manifest.json'),
    JSON.stringify({ name: 'App' }),
);
```

nice ver:

```ts
import path from 'path-nice';

const app = await path('./app').realpath();
const publicDir = app.join('public');
await publicDir.join('manifest.json')
               .writeJSON({ name: 'App' });
```

Especially when you need to import some predefined paths from other modules, `path-nice`
is doubly convenient: instead of importing additional `path` and `fs` modules, just import
the paths you need, type a dot, and all the methods you need are present.

### Detailed JSDoc, no need to go through docs, examples are all there

![](https://raw.githubusercontent.com/FuuuOverclocking/path-nice/main/docs/images/jsdoc.png)

### Can bind other filesystem implementations, e.g. memory file system [memfs](https://github.com/streamich/memfs)

```ts
import path from 'path-nice';
import { fs as memfs } from 'memfs';

const mpath = path
    .posix          // Use POSIX-style paths (memfs only supports POSIX-style)
    .bindFS(memfs); // bind file system

await mpath('/index.ts')
    .writeFile('export default 42;');
```

### Metaprogramming, the path is known at compile time

(Coming soon in version 2.1.0)

![](https://raw.githubusercontent.com/FuuuOverclocking/path-nice/main/docs/images/meta-programming.png)

## Installation

```shell
npm install path-nice
```

or

```shell
yarn add path-nice
```

- Requires: Node.js >= v12.0.0
- Provided: CommonJS, ESModule and TypeScript typings
- ESModule version can be [used directly in Node](https://nodejs.org/api/esm.html#modules-ecmascript-modules).

## Documents

Please refer to [API Reference](https://fuuuoverclocking.github.io/path-nice/functions/default.html).

## 3 minutes guide

Add a pair of `()` after `path` to enter "nice" mode.

```ts
import path from 'path-nice'

const dir = path('./src')
```

`dir` is the instance of `class PathNice`:

```ts
dir instanceof path.PathNice    // true
```

A `PathNice` instance is a wrapper of the raw path string, so that the path can be easily
used to generate additional paths or manipulate files.:

```ts
dir.raw === './src'             // true
```

Each `PathNice` instance is an immutable object, all properties are read-only:

```ts
Object.isFrozen(dir)            // true
```

### Path related methods

<p align="center"><img src="docs/images/path-parts.png" width="500" /></p>

```ts
let f = path('path-nice/src')

f = f.join('index.ts')           // path('path-nice/src/index.ts')

// For the following 4 methods: 0 args = get, 1 arg = set

f.dirname()                     // path('path-nice/src')
f.dirname('another-dir')        // path('another-dir/index.ts')

f.filename()                    // 'index.ts'
f.filename('types.ts')          // path('path-nice/src/types.ts')

f.ext()                         // '.ts'
f.ext('.js')                    // path('path-nice/src/index.js')

f.separaotr()                   // '/'
f.separaotr('\\')               // path('path-nice\\src\\index.ts')

// .parent is an alias for .dirname(), can get the path to the parent directory
f.parent.raw === f.dirname().raw // true

const f2 = f.parent.parent.join('package.json')
f2.raw                          // 'path-nice/package.json'

f2.isAbsolute()                 // false
f2.toAbsolute()                 // path('/work/path-nice/package.json'), suppose cwd is '/work'

// Use .realpath() to get the absolute path and resolve the
// soft links that may exist in the path at the same time.
await f2.realpath()             // path('/project/path-nice/package.json')
                                // suppose cwd is '/work', and '/work' points to '/project'

f2.toRelative('path-nice/docs') // path('../package.json')

f2.prefixFilename('old.')       // path('path-nice/old.package.json')
f2.postfixBeforeExt('.old')     // path('path-nice/package.old.json')
f2.postfix('.old')              // path('path-nice/package.json.old')
```

For more path-related methods, see [docs of PathNice](https://fuuuoverclocking.github.io/path-nice/interfaces/PathNice.html).

### File system related methods

It can be noted that, many functions in the `fs` module, such as `readFile` and `writeFile`,
almost always have `path` as their first parameter. `path-nice` rewrites them as member methods of `class PathNice`, and makes it easier to call them by automatically filling this parameter with the current path.

Most of the following methods are asynchronous methods, returning a `Promise`. Add the suffix `Sync` to the function names to get their synchronous versions.

#### Read and write

- `readFile`
- `readFileToString`: Same as `readFile`, but guaranteed to return a `string`. Default: UTF-8
- `readJSON`: read the file, then parse as json. Default: UTF-8
- `writeFile`
- `writeJSON`: Serialize the json object, then write it to the file. Default: UTF-8, 4 spaces as indent
- `outputFile`: Same as `writeFile`, automatically create the parent directory if it does not exist
- `outputJSON`: Same as `writeJSON`, automatically create the parent directory if it does not exist
- `updateFileAsString`
  
  Execute a function to quickly update a file.

  e.g.

  ```ts
  await path('README.md')
      .updateFileAsString(str => str.replace(/path/g, 'path-nice'))
  ```
- `updateJSON`
  
  Execute a function to quickly update a JSON file.
  
  e.g.
  
  ```ts
  await path('package.json')
      .updateJSON(json => { json.version = '1.0.0' })
  ```
- `appendFile`
- `createReadStream`
- `createWriteStream`
- `open`

#### Copy, move and remove

Directories containing files can also be copied, moved, or deleted directly. Supports moving files across devices.

- `copy`
- `move`
- `remove`
- `delete`: Alias of `remove`
- `rename`
- `emptyDir`: Empty the folder, and ensure it exists

#### Ensure

Ensure the directory or file exists. If it doesn't, create it automatically.

- `emptyDir`: Empty the folder, and ensure it exists
- `ensureDir`
- `ensureFile`

#### Is ... ?

- `isDir`
- `isEmptyDir`
- `isFile`
- `isSymbolicLink`
- `exists`

#### List directory contents

- `ls`: Returns `Promise<{ dirs: PathNiceArr, files: PathNiceArr }>`, directories and files already sorted out, all absolute paths, easier to use
- `readdir`

#### Watch

- `watchWithChokidar`: use npm package `chokidar` to watch files, API is more friendly and powerful
- `watch`
- `watchFile`
- `unwatchFile`

#### File info

- `fileSize`: Get the file size, including the size in `B`, `KB`, `MB`, `GB`, etc.
- `fileMode`: Gets the file mode
- `fileOwner`: Get the file owner
- `chmod`
- `chown`
- `lchown`
- `stat`
- `lstat`

### `PathNiceArr`

When multiple arguments are passed to `path()`, or an array, it returns a `PathNiceArr`:

```ts
import path from 'path-nice';

let arr = path('./README.md', './package.json', './tsconfig.json');
```

`class PathNiceArr` is a subclass of `class Array`. The methods of `Array` can be called in a normal way:

```ts
arr = arr.filter(f => f.ext() === '.json')
// PathNiceArr [
//     PathNice { raw: './package.json' },
//     PathNice { raw: './tsconfig.json' },
// ]
```

It also adds some additional methods to holistically manipulate files in the array:

```ts
await arr.copyToDir('. /json-config'); // each file in arr is copied to the json-config directory
```

If `arr.base` is set, the files will maintain their directory structure relative to `base` when copying or moving files. When not set, files are copied or moved one by one. For example:

```ts
/*
Assuming cwd = /work, and ./src contains the following files:
   ./src
    ├── lib/
    │   ├── jquery.js
    │   └── types.ts
    └── index.ts
*/

const { dirs, files } = await path('./src').ls(/* recursive */ true);

console.log(files);
// PathNiceArr(3) [
//     PathNice { raw: '/work/src/index.ts' },
//     PathNice { raw: '/work/src/lib/jquery.js' },
//     PathNice { raw: '/work/src/lib/types.ts' },
//     base: PathNice { raw: '/work/src' }
// ]

await files.copyToDir('dist');
/*
The directory structure of dist at this point:
   ./dist
    ├── lib/
    │   ├── jquery.js
    │   └── types.ts
    └── index.ts
*/

await path('dist').emptyDir();  // empty the dist directory
files.base = undefined;         // clear base

await files.copyToDir('dist');
/*
The directory structure of dist at this point:
   ./dist
    ├── jquery.js
    ├── types.ts
    └── index.ts
*/
```

For detailed usage of `PathNiceArr`, see [docs of PathNiceArr](https://fuuuoverclocking.github.io/path-nice/interfaces/PathNiceArr.html).
