# KaTeX, vendored

`katex.mjs` is `dist/katex.mjs` from the npm package [`katex`](https://www.npmjs.com/package/katex)
**0.19.0**, unmodified, under the MIT licence in `LICENSE`. `check` uses it to hold every
Note's mathematics to the KaTeX subset (invariant 8, ADR-0006).

It is vendored rather than installed because the tooling has no install step: a terminal and
CI run the same `npm run check` on a bare checkout. The file is self-contained — no imports.

To update it, replace `katex.mjs` with the same file from the new release, change the version
above, and run `npm test` and `npm run check`. A newer KaTeX can accept more than this one;
that is fine only while Obsidian's MathJax accepts it too.

sha256 of 0.19.0's `katex.mjs`: `e5bc26598084ad869939ecaa262673814f26ed586312a409b5f8427c01e4f681`
