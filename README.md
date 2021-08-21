# statusMatrix
A non-core implementation of the `statusMatrix` command that's easier for folks to fork and tweak

Known issues:
- unlike the core implementation, this one doesn't respect `.gitignore` files which is extremely annoying. TODO: add an `isIgnored` function to `isomorphic-git` so we can utilize that in user code.
