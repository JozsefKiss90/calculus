---
kind: concept
domain: limits
requires:
  - "[[Left-hand and right-hand limits]]"
  - "[[Closeness and distance]]"
status: stub
reviewed_by: none
created: 2026-10-02
updated: 2026-10-02
---

## In one sentence

## Why you need this

## The idea

```interactive
archetype: limit-table
function:
  family: rational
  coefficients: [1, 0, -1]
  denominator: [1, -1]
  label: 'f(x) = \frac{x^2 - 1}{x - 1}'
approach: 1
caption: There is no output at 1 itself, but both columns close in on 2.
```

## Worked example

## Common mistakes

## Builds on

<!-- generated:start builds-on -->
- [[Left-hand and right-hand limits]]
- [[Closeness and distance]]
<!-- generated:end builds-on -->

## Required by

<!-- generated:start required-by -->
- [[Limit of sin h over h as h approaches zero]]
- [[Limits]]
<!-- generated:end required-by -->

<!-- generated:start mini-map -->
```mermaid
flowchart TD
    N["Approaching a value"]
    N --> P1["Left-hand and right-hand limits"]
    N --> P2["Closeness and distance"]
    D1["Limit of sin h over h as h approaches zero"] --> N
    D2["Limits"] --> N
    class N,P1,P2,D1,D2 internal-link
    style N stroke-width:3px
```
<!-- generated:end mini-map -->

## References
