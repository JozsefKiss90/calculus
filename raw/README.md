# raw/

Extracted source material. Outside the vault, and immutable.

A Source Curator writes a file here once, when it extracts material from a named
high-trust reference. Nothing edits that file afterwards — no agent, no script, no
later run of the pipeline. Not to correct it, not to reformat it, not to tidy it.

The reason is provenance. A Note cites a source Note; a source Note names a file in
here; that file has to still say what the source actually said. A raw extract that
drifts is worse than no extract, because the citation still looks sound.

If a source changes, extract it again as a new file and leave the old one alone.

`raw/` sits at the repo root rather than inside `wiki/` so that the vault holds
authored learning content only.

## How immutability is checked

`checksums.sha256` holds one line per extract, `<sha256>  <path inside raw/>`, as
`sha256sum` prints it. A Source Curator appends a line when it writes an extract and never
changes one. `check` fails, under invariant 12, when an extract's bytes no longer match
its line, when a tracked extract is gone, or when a file here has no line at all. It also
fails when a source Note's `source_file` names no file here. To verify the store by hand:

    cd raw && sha256sum -c checksums.sha256

`.gitattributes` marks everything here `-text`, so no clone rewrites an extract's line
endings. This file and `checksums.sha256` describe the store and are not extracts.
