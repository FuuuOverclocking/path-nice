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



