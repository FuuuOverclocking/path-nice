# path-nice

English | [简体中文](README-cn.md)

`path-nice` - How `path` and `fs` should be designed.

If sometimes you do not feel nice about `path` or `fs` of Node.js, then just

<img src="https://raw.githubusercontent.com/FuuuOverclocking/path-nice/main/docs/images/add-nice-here.png" width="500" />

All existing code still works, while the `path` evolves.

## Why this lib?

### One lib against `path` and `fs`, shortens the code considerably

Original ver:

```ts
const src = path.resolve('./src');
await fs.promises.writeFile(
    path.join(src, 'index.ts'),
    'export default 42;',
);
```

nice ver:

```ts
const src = path('./src').toAbsolute();
await src.join('index.ts')
         .writeFile('export default 42;');
```

### Informative comments, no need to go through docs, examples are all there

![](https://raw.githubusercontent.com/FuuuOverclocking/path-nice/main/docs/images/jsdoc.png)

### Support for specifying other fs, e.g. memory file system [memfs](https://github.com/streamich/memfs)

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

(POSIX only)

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

## 3 minutes guide

> ⚠️ The API of this library will be stable in version 2.0, do not use it in production until then.

Here are some examples. For full usage, please refer to [API Reference](https://fuuuoverclocking.github.io/path-nice/interfaces/Path.html).

Add a pair of `()` after `path` to enter "nice" mode.

```ts
import path from 'path-nice'

const pkg = path('./package.json')

// A PathNice instance is a wrapper of the raw path string, so that the path
// can be easily used to generate additional paths or manipulate files.
pkg.raw === './package.json'    // true

// is the instance of PathNice
pkg instanceof path.PathNice    // true

// is an immutable object, all properties are read-only
Object.isFrozen(pkg)            // true
```

### Path related methods

<p align="center"><img src="docs/images/path-parts.png" width="500" /></p>

```ts
const f = path('path-nice/src/index.ts')

// For the following 4 methods: 0 args = get, 1 arg = set

f.dirname()                     // path('path-nice/src')
f.dirname('another-dir')        // path('another-dir/index.ts')

f.filename()                    // 'index.ts'
f.filename('types.ts')          // path('path-nice/src/types.ts')

f.ext()                         // '.ts'
f.ext('.js')                    // path('path-nice/src/index.js')

f.separaotr()                   // '/'
f.separaotr('\\')               // path('path-nice\\src\\index.ts')

// .parent is an alias for .dirname(), return the path to the parent directory.
f.parent.raw === f.dirname().raw // true

const f2 = f.parent.parent.join('package.json')
f2.raw                          // 'path-nice/package.json'

f2.prefixFilename('old.')       // path('path-nice/old.package.json')
f2.postfixBeforeExt('.old')     // path('path-nice/package.old.json')
f2.postfix('.old')              // path('path-nice/package.json.old')

f2.isAbsolute()                 // false
f2.toAbsolute()                 // path('/work/path-nice/package.json'), suppose cwd is '/work'
f2.toRelative('path-nice/docs') // path('../package.json')
await f2.realpath()             // path('/work/path-nice/package.json'), suppose cwd is '/work',
                                // and there are no symbolic links here.
f2.realpathSync()               // Sync ver

const parsedF2 = f2.toAbsolute().parse()

// 0 args = get, 1 arg = set

parsedF2.root()                 // '/'
parsedF2.dir()                  // '/work/path-nice'
parsedF2.base()                 // 'package.json'
parsedF2.name()                 // 'package'
parsedF2.ext()                  // '.json'

parsedF2.dir('/home/fuu').ext('.md')
    .format()                   // path('/home/fuu/package.md')
```

### File system related methods

It can be noted that, the functions in the `fs` module, such as `readFile` and `writeFile`,
almost always have `path` as their first parameter, so it could be more convenient to call
these functions if we rewrite them into the form of member functions of path class.

Most of the following methods return a `Promise`, and they also have a synchronized version,
with the `Sync` suffix added to the function name.

#### Read and write

- readFile
- readString: = readFile, but guaranteed to return a string, UTF-8 by default
- readBuffer: = readFile, but guaranteed to return a Buffer
- readJSON: read the file, then parse as json
- writeFile
- writeJSON: UTF-8, 4 spaces indent by default
- outputFile: = writeFile, automatically create the parent directory if it does not exist
- outputJSON
- updateString
  
  e.g.

  ```ts
  path('README.md')
      .updateString(str => str.replace(/path/g, 'path-nice'))
  ```
- updateJSON
  
  e.g.
  
  ```ts
  path('package.json')
      .updateJSON(json => { json.version = '1.0.0' })
  ```
- appendFile
- createReadStream
- createWriteStream
- open

#### Copy, move and remove

Directories can also be directly copied and moved for deletion. Support for moving files across devices.

- copyAs: copy **as** ...
- copyToDir: copy **into** a directory
- moveAs
- moveToDir
- remove
- rename
- emptyDir

#### Ensure

Ensure the directory or file exists. If it doesn't, create it automatically.

- emptyDir
- ensureDir
- ensureFile

#### Is ... ?

- isDir
- isEmptyDir
- isFile
- isSymbolicLink
- exists

#### List directory contents

- ls: Returns `Promise<{ dirs: PathNice[], files: PathNice[] }>`, directories and files already sorted out, all absolute paths, easier to use
- readdir

#### Watch

- watch
- watchFile
- unwatchFile

#### Others

- chmod
- lchmod
- chown
- lchown
- stat
- lstat
