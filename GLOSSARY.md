# Calculus

A mathematics teaching system. Learning material is authored as an Obsidian wiki; the web app that teaches from it is generated from that wiki.

## Language

### The graph and its pieces

**Node**:
A single mathematical concept together with its edges to the concepts it requires and the concepts that require it. The unit of the prerequisite graph.
_Avoid_: topic, vertex, card

**Note**:
The one markdown file in the wiki that carries a Node. Exactly one Note per Node.
_Avoid_: document, article, entry

**Page**:
The one route in the web app that renders a Note. Exactly one Page per Note.
_Avoid_: screen, view, lesson

**Edge**:
A directed prerequisite relation between two Nodes: the source cannot be understood before the target. Distinct from a Cross-reference, which carries no ordering claim.
_Avoid_: link, dependency, relation

**Cross-reference**:
A link between two Notes that makes no claim about ordering — an aside, a contrast, a place the idea reappears. Never an Edge, and never counted as one.
_Avoid_: related link, see-also

**Anchor Graph**:
The reviewed, frozen inventory of a Module's Nodes and Edges, fixed before any content is written. Agents may propose changes to it but never make them.
_Avoid_: outline, map, skeleton, plan

### Scope and shape

**Module**:
A body of learning material defined by one Terminal Node and everything that node requires, down to the Floor.
_Avoid_: course, unit, subject, arc

**Terminal Node**:
The single Node a Module exists to teach. A Module has exactly one. The first Module's Terminal Node is the derivative.
_Avoid_: goal, target, root, capstone

**Floor Node**:
A Node at a Module's assumed-knowledge boundary. Nothing a Floor Node requires is explained within the Module; the Module assumes the learner arrives with it. The Floor for the first Module is 8th-grade mathematics.
_Avoid_: leaf, base, primitive, axiom

**Floor**:
The assumed-knowledge boundary of a Module. Below it, nothing is explained; at it, everything is. The first Module's Floor is 8th-grade mathematics.
_Avoid_: baseline, entry level, prerequisites

**Prerequisite Closure**:
The complete set of Nodes reachable by following Edges from a Terminal Node down to the Floor. A Module's content is its Terminal Node's Prerequisite Closure, and nothing else.
_Avoid_: dependency tree, syllabus, curriculum

**Layer**:
The set of Nodes whose longest path to the Floor is the same length. Layer 0 is the Floor. A Node in Layer N requires only Nodes in lower Layers, so a whole Layer can be written at once.
_Avoid_: level, tier, stage, depth

**Context Pack**:
The generated, self-contained briefing handed to an agent for one Node: everything it needs to write that Note, and nothing else. An agent reads its Context Pack instead of the Wiki.
_Avoid_: ticket, brief, prompt, task

**Review Bundle**:
The generated briefing handed to a Correctness Reviewer for one written Note: the Note, its prerequisites' Notes and its Layer siblings' Notes, whole. Where a Context Pack keeps an author's view narrow, a Review Bundle widens a reviewer's to what the author could not see.
_Avoid_: review pack, review context

### Interactive material

**Archetype**:
One reviewed, reusable kind of interactive element — a unit circle explorer, a secant converging on a tangent. A small closed set of them exists, and every interactive element in the Wiki is an instance of one.
_Avoid_: widget, component, visualisation type, template

**Interactive**:
An instance of an Archetype in a Note, written as a declarative specification rather than as rendering code.
_Avoid_: embed, applet, animation, graph

### The two artefacts

**Wiki**:
The authored body of Notes, and the single source of truth for all learning content. Also the Obsidian vault: the two coincide.
_Avoid_: vault (when speaking of content), docs, knowledge base

**App**:
The web application that teaches from the Wiki. Holds no content of its own; everything it shows is generated from the Wiki.
_Avoid_: site, frontend, client
