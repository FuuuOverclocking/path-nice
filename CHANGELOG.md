## [2.0.4](https://github.com/FuuuOverclocking/path-nice/compare/v2.0.3...v2.0.4) (2022-07-23)


### Bug Fixes

* fix the bug that copySync and moveSync accidentally throw errors when dest does not exist ([9b79f4a](https://github.com/FuuuOverclocking/path-nice/commit/9b79f4ab2241348a8e3c3f8578f0ece3fdfcaf2b))


### Features

* add toString() ([f7e7fdb](https://github.com/FuuuOverclocking/path-nice/commit/f7e7fdb1bbdde7f9c315cde47ec70f6d1231c1d6))



## [2.0.3](https://github.com/FuuuOverclocking/path-nice/compare/v2.0.2...v2.0.3) (2022-07-21)



## [2.0.2](https://github.com/FuuuOverclocking/path-nice/compare/v2.0.1...v2.0.2) (2022-07-21)


### Bug Fixes

* fix the issue that cjs version was prompting incorrectly when used directly in node ([e31db2b](https://github.com/FuuuOverclocking/path-nice/commit/e31db2be23df910eae899d545ba668d1fb4f3fc4))
* options.force of copy() should be true ([f21e4b5](https://github.com/FuuuOverclocking/path-nice/commit/f21e4b5e949f78387be9b8d96abe907e1173875d))



## [2.0.1](https://github.com/FuuuOverclocking/path-nice/compare/v2.0.0...v2.0.1) (2022-07-20)


### Bug Fixes

* fill in the missing links ([83f6343](https://github.com/FuuuOverclocking/path-nice/commit/83f6343769a621cf592e8b5ff8743ad401df96d7))



# [2.0.0](https://github.com/FuuuOverclocking/path-nice/compare/v1.2.3...v2.0.0) (2022-07-20)


### Features

* add `delete()`; `toRelative()` can have no args ([b7322eb](https://github.com/FuuuOverclocking/path-nice/commit/b7322eb20c08644d4f75d1b40652d8093f7d2413))
* add types of original array methods of PathNiceArr ([e3089ec](https://github.com/FuuuOverclocking/path-nice/commit/e3089ecce1fdeef21d63f6e636c758ba950a8f84))
* toAbsolute() now supports relative path as arg; base of returned PathNiceArr of ls() becomes absoulte; In PathNiceArr, the original array method returns a new array with the same base as the original array ([74569ae](https://github.com/FuuuOverclocking/path-nice/commit/74569aec24814232b951b29e83e3b0684e67b50d))



## [1.2.3](https://github.com/FuuuOverclocking/path-nice/compare/v1.2.2...v1.2.3) (2022-07-03)


### Bug Fixes

* fix exports ([741e332](https://github.com/FuuuOverclocking/path-nice/commit/741e332f4dd9e838ac41c68a11d7a2f01cdae15c))



## [1.2.2](https://github.com/FuuuOverclocking/path-nice/compare/v1.2.1...v1.2.2) (2022-07-03)


### Features

* pathPosix() can accept multiple parameters, can be strings or paths, and infer the return type ([5c229ba](https://github.com/FuuuOverclocking/path-nice/commit/5c229bacaa8c83734e67ba9f5b112eaa5d35d7fa))



## [1.2.1](https://github.com/FuuuOverclocking/path-nice/compare/v1.2.0...v1.2.1) (2022-07-03)


### Bug Fixes

* adjust import / export structure to fix esm ([ea58149](https://github.com/FuuuOverclocking/path-nice/commit/ea58149418dd4043865770a743235b3d11af82a5))



# [1.2.0](https://github.com/FuuuOverclocking/path-nice/compare/v1.1.0...v1.2.0) (2022-07-03)


### Features

* **common:** emptyDir now create dir if not exists ([3cf3452](https://github.com/FuuuOverclocking/path-nice/commit/3cf3452b1baa5e4a91adfde279536a2ebcbf0c20))
* now fn of updateXXX can return a Promise ([6d0640b](https://github.com/FuuuOverclocking/path-nice/commit/6d0640b24bad28615cdfe6513fcc2f6c08453dc1))



# [1.1.0](https://github.com/FuuuOverclocking/path-nice/compare/v1.0.0...v1.1.0) (2022-07-03)


### Bug Fixes

* copy should use the path provided; JSON.stringify use 4 spaces by default ([f9c51d3](https://github.com/FuuuOverclocking/path-nice/commit/f9c51d3fcd16071bf569bc0552cd5c7f2cd78c7b))


### Features

* add copyTo impl ([27df486](https://github.com/FuuuOverclocking/path-nice/commit/27df4866c0f35343bef987ab6bdd876d2161354b))
* add fs read/write methods ([87751e7](https://github.com/FuuuOverclocking/path-nice/commit/87751e79cc2a0e6c60e575c511a7aa5c741d5779))
* add fs related methods; now filename() returns a string ([0433155](https://github.com/FuuuOverclocking/path-nice/commit/04331553447d867c5272ff7311993de7dfd7c038))
* add move and remove, modify copy ([5fd1043](https://github.com/FuuuOverclocking/path-nice/commit/5fd104380ae912aab8b423d4c5646c17ab57f42c))
* add posix and win32 specific pathing ([7298323](https://github.com/FuuuOverclocking/path-nice/commit/7298323add55fa20c4dca936a2fdfc54b7a5affb))
* fix jsdoc, remove .dotdot, fix .filename(), add .outputFile(), .outputJson(), etc ([a047cca](https://github.com/FuuuOverclocking/path-nice/commit/a047cca4206255b95b57c6d3418475aa58852af0))
* **posix/type-gymnastics:** add ForceSep, fix the result of Join and Normalize when input is string ([c972a5b](https://github.com/FuuuOverclocking/path-nice/commit/c972a5b079e5d87ffe35d5a887050ddab5cf19b2))
* some methods of PathNice and their documentation have been modified ([988a4c6](https://github.com/FuuuOverclocking/path-nice/commit/988a4c6177da6ae0b2d9e013c9f6d7420862996c))
* xxxJson rename to xxxJSON ([37e3342](https://github.com/FuuuOverclocking/path-nice/commit/37e33428a87255ed1cfd86680b5c9352a652ccca))


### BREAKING CHANGES

* readJson, writeJson, outputJson and updateJson are renamed readJSON, writeJSON,
outputJSON, updateJSON respectively.



