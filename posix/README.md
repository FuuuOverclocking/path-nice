# What is this folder for

As a package, `path-nice` exports the following paths:

- `.`: the default entry
- `./posix` and `./win32`:
    - provides access to POSIX-specific or Windows-specific implementations of the path methods
    - are imitation of the exports of Node.js `path` module, see [posix](http://nodejs.cn/api/path.html#pathposix) and [win32](http://nodejs.cn/api/path.html#pathwin32)

Recent versions of Node can recognize the `exports` field in `/package.json` to directly achieve the exports mentioned above, but old versions or other packaging tools can't.

Therefore, a `/posix/package.json` file is provided here to guide them to relocate to the correct place when they resolve this path.
