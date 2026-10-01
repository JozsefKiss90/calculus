# Interactives are Archetype instances, and name no library

An interactive element is authored as a fenced ` ```interactive ` block holding a declarative specification that names an **Archetype** from a small closed set and fills in its parameters. The markdown never names a rendering library, never contains component code, and never contains a JavaScript expression. Agents author instances; they do not author rendering logic.

## Considered Options

**Mirror a library's element model** — the spec maps onto JSXGraph's `create(type, parents, attributes)` triples, and agents emit element trees.

**Component code per interactive** — a specialist agent writes the rendering code for each visualisation.

**Archetype instances** (chosen).

## Consequences

Quality is controlled once per Archetype rather than once per interactive. With roughly 60 Notes in the first Module alone, reviewing novel rendering logic per visualisation means reviewing the same class of mistake dozens of times; reviewing a dozen Archetypes once and then checking parameter instances is tractable, and it is the only version of "quality takes precedence over simplicity" that survives contact with an agent fleet.

It keeps the web app's framework choice genuinely deferred. The leading renderer candidate, Mafs, is React-only as a hard peer dependency and takes JavaScript closures as props — so a spec written against Mafs would decide the app's framework by implication, and a spec written against any library would have to be rewritten to change it. Naming no library in the content layer means the renderer can be chosen, and later replaced, without touching a single Note.

The cost is expressiveness. An interactive that no Archetype covers cannot be authored at all until someone adds an Archetype — deliberately, because the alternative is agents inventing one-off visualisations that nobody reviews. Adding an Archetype is a reviewed act, and the catalogue is expected to grow.
