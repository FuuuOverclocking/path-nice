# path-nice

[![npm version](https://img.shields.io/npm/v/path-nice)](https://www.npmjs.com/package/path-nice) ![license-MIT](https://img.shields.io/badge/license-MIT-green.svg) ![npm-bundle-size](https://img.shields.io/bundlephobia/minzip/path-nice) ![coverage](https://raw.githubusercontent.com/FuuuOverclocking/path-nice/main/docs/images/coverage.svg)

[English](README.md) | 简体中文

`path-nice` - 优雅又趁手的 `path`, `fs` 和 `glob` 的替代品

如果有时你对 Node.js 的原装 `path` 与 `fs` 感到不那么 nice, 那么只需

<img src="https://raw.githubusercontent.com/FuuuOverclocking/path-nice/main/docs/images/add-nice-here-cn.png" width="500" />

现有代码仍然正常工作, 而 `path` 却已进化.

## Why this lib?

### 一个顶俩, 还能大大缩短代码

原始版:

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

nice 版:

```ts
import path from 'path-nice';

const app = await path('./app').realpath();
const publicDir = app.join('public');
await publicDir.join('manifest.json')
               .writeJSON({ name: 'App' });
```

特别是当你需要从其他模块导入一些预定义的路径时, `path-nice` 能带来加倍便利: 不必再额外导入 `path` 和
`fs` 模块了, 只需导入你需要的路径, 然后打一个点号, 所需方法全部呈现.

### 注释翔实, 文档不用翻, 例子都在这

![](https://raw.githubusercontent.com/FuuuOverclocking/path-nice/main/docs/images/jsdoc.png)

### 可以绑定其他 filesystem 的实现使用, 例如内存文件系统 [memfs](https://github.com/streamich/memfs)

```ts
import path from 'path-nice';
import { fs as memfs } from 'memfs';

const mpath = path
    .posix          // 使用 POSIX 风格的路径 (memfs 仅支持该风格)
    .bindFS(memfs); // 绑定文件系统

await mpath('/index.ts')
    .writeFile('export default 42;');
```

### 元编程加持, 路径是啥, 编译时就知道

(将在 2.1.0 版本到来)

![](https://raw.githubusercontent.com/FuuuOverclocking/path-nice/main/docs/images/meta-programming.png)

## 安装

```shell
npm install path-nice
```

或者

```shell
yarn add path-nice
```

- 需要: Node.js >= v12.0.0
- 提供: CommonJS, ESModule 和 TypeScript typings
- ESModule 版本可以[直接在 Node 中使用](https://nodejs.org/api/esm.html#modules-ecmascript-modules).

## 文档

请参见 [API Reference](https://fuuuoverclocking.github.io/path-nice/functions/default-1.html).

## 3 分钟教程

在 `path` 后添加一对 `()` 以进入 "nice" 模式.

```ts
import path from 'path-nice'

const dir = path('./src')
```

`dir` 是 `class PathNice` 的实例:

```ts
dir instanceof path.PathNice    // true
```

一个 `PathNice` 实例是对 raw path string 的包装, 以便快捷地生成其他路径, 或操作文件:

```ts
dir.raw === './src'             // true
```

每个 `PathNice` 实例都是不可变对象, 所有属性是只读的:

```ts
Object.isFrozen(dir)            // true
```

### 路径相关方法

<p align="center"><img src="docs/images/path-parts.png" width="500" /></p>

```ts
let f = path('path-nice/src')

f = f.join('index.ts')           // path('path-nice/src/index.ts')

// 以下 4 个方法: 0 个参数 = get, 1 个参数 = set

f.dirname()                     // path('path-nice/src')
f.dirname('another-dir')        // path('another-dir/index.ts')

f.filename()                    // 'index.ts'
f.filename('types.ts')          // path('path-nice/src/types.ts')

f.ext()                         // '.ts'
f.ext('.js')                    // path('path-nice/src/index.js')

f.separaotr()                   // '/'
f.separaotr('\\')               // path('path-nice\\src\\index.ts')

// .parent 是 .dirname() 的别名, 可获取父目录路径
f.parent.raw === f.dirname().raw // true

const f2 = f.parent.parent.join('package.json')
f2.raw                          // 'path-nice/package.json'

f2.isAbsolute()                 // false
f2.toAbsolute()                 // path('/work/path-nice/package.json'), 假定 cwd 是 '/work'

// 使用 .realpath() 可在获取绝对路径的同时, 解析路径中可能存在的软链接
await f2.realpath()             // path('/project/path-nice/package.json')
                                // 假定 cwd 是 '/work', 并且 '/work' 指向 '/project'

f2.toRelative('path-nice/docs') // path('../package.json')

f2.prefixFilename('old.')       // path('path-nice/old.package.json')
f2.postfixBeforeExt('.old')     // path('path-nice/package.old.json')
f2.postfix('.old')              // path('path-nice/package.json.old')
```

更多路径相关方法, 参见 [PathNice 文档](https://fuuuoverclocking.github.io/path-nice/interfaces/PathNice.html).

### 文件系统相关方法

可以注意到, `fs` 模块中的诸多函数, 例如 `.readFile()`, `.writeFile()` 等, 它们的第一个参数几乎都是 `path`.
`path-nice` 将它们改写为了 `class PathNice` 的成员方法, 将这一参数自动填写为当前路径, 使其调用起来更加方便.

下面大多数方法是异步方法, 返回一个 `Promise`. 在函数名加上后缀 `Sync`, 即为它们的同步版本.

这些方法的具体用法, 可在 [PathNice 文档](https://fuuuoverclocking.github.io/path-nice/interfaces/PathNice.html), 或编辑器的提示中找到.

#### Read and write

- `readFile`
- `readFileToString`: 等同于 `readFile`, 但保证返回 `string`. 默认 UTF-8
- `readJSON`: 读取文件, 再作为 json 解析. 默认 UTF-8
- `writeFile`
- `writeJSON`: 序列化 json 对象, 再写入文件. 默认 UTF-8, 4 个空格缩进
- `outputFile`: 等同于 `writeFile`, 但如果文件所在目录不存在, 自动创建
- `outputJSON`: 等同于 `writeJSON`, 但如果文件所在目录不存在, 自动创建
- `updateFileAsString`
  
  执行一个函数, 快捷地更新一个文件.

  例如:

  ```ts
  await path('README.md')
      .updateFileAsString(str => str.replace(/path/g, 'path-nice'))
  ```
- `updateJSON`
  
  执行一个函数, 快捷地更新一个 JSON 文件.
  
  例如:
  
  ```ts
  await path('package.json')
      .updateJSON(json => { json.version = '1.0.0' })
  ```
- `appendFile`
- `createReadStream`
- `createWriteStream`
- `open`

#### Copy, move and remove

含有文件的目录也可直接复制, 移动, 删除. 支持跨设备移动文件.

- `copy`
- `move`
- `remove`
- `delete`: `remove` 的别名
- `rename`
- `emptyDir`: 清空文件夹, 并保证文件夹存在

#### Ensure

确保文件夹或文件存在, 如果不存在, 则自动创建.

- `emptyDir`: 清空文件夹, 并保证文件夹存在
- `ensureDir`
- `ensureFile`

#### Is ... ?

- `isDir`
- `isEmptyDir`
- `isFile`
- `isSymbolicLink`
- `exists`

#### List directory contents

- `ls`: 返回 `Promise<{ dirs: PathNiceArr, files: PathNiceArr }>`, 已经区分目录与文件, 均为绝对路径, 用起来更省心
- `readdir`

#### Watch

- `watchWithChokidar`: 使用 npm 包 `chokidar` 来监视文件, API 更加友好和强大
- `watch`
- `watchFile`
- `unwatchFile`

#### File info

- `fileSize`: 获取文件大小, 包括以 `B`, `KB`, `MB`, `GB` 等单位计量的大小
- `fileMode`: 获取文件 mode
- `fileOwner`: 获取文件 owner
- `chmod`
- `chown`
- `lchown`
- `stat`
- `lstat`

### `PathNiceArr`

当提供给 `path()` 多个参数, 或一个数组时, 它将返回一个 `PathNiceArr`:

```ts
import path from 'path-nice';

let arr = path('./README.md', './package.json', './tsconfig.json');
```

`class PathNiceArr` 是 `class Array` 的子类, 可以正常调用数组的方法:

```ts
arr = arr.filter(f => f.ext() === '.json')
// PathNiceArr [
//     PathNice { raw: './package.json' },
//     PathNice { raw: './tsconfig.json' },
// ]
```

它还添加了一些额外的方法, 以便整体性地操作文件:

```ts
await arr.copyToDir('./json-config');       // arr 中的每个文件都被复制到 json-config 目录下
```

如果设置了 `arr.base`, 则在复制或移动文件时, 文件将相对于 `base` 保持目录结构. 未设置时, 文件的复制或移动
是逐个进行的. 例如:

```ts
/*
假设 cwd = /work, ./src 中有如下文件:
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
此时 dist 的目录结构:
   ./dist
    ├── lib/
    │   ├── jquery.js
    │   └── types.ts
    └── index.ts
*/

await path('dist').emptyDir();  // 清空 dist 文件夹
files.base = undefined;         // 清除 base

await files.copyToDir('dist');
/*
此时 dist 的目录结构:
   ./dist
    ├── jquery.js
    ├── types.ts
    └── index.ts
*/
```

`PathNiceArr` 的详细用法, 参见 [PathNiceArr 文档](https://fuuuoverclocking.github.io/path-nice/interfaces/PathNiceArr.html).
