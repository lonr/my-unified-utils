# unist-util-map-postorder

[unist](https://github.com/syntax-tree/unist) utility to create a new tree by mapping all nodes in postorder traversal with a given function.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). In Node.js, install with [npm](https://docs.npmjs.com/cli/install):

```shell
npm install unist-util-map-postorder
```

## Use

```js
import { u } from 'unist-builder';
import { map } from 'unist-util-map-postorder';

const tree = u('tree', [
  u('leaf', 'leaf 1'),
  u('node', [u('leaf', 'leaf 2')]),
  u('void'),
  u('leaf', 'leaf 3'),
]);

const next = map(tree, (node) => {
  return node.type === 'leaf' ? Object.assign({}, node, { value: 'CHANGED' }) : node;
});

console.dir(next, { depth: null });
```

Yields:

```js
{
  type: 'tree',
  children: [
    {type: 'leaf', value: 'CHANGED'},
    {type: 'node', children: [{type: 'leaf', value: 'CHANGED'}]},
    {type: 'void'},
    {type: 'leaf', value: 'CHANGED'}
  ]
}
```

> **Note**: `next` is a changed clone and `tree` is not mutated.

The given function was applied in postorder traversal.

More features:

- Support replacing the original node with an array of nodes returned(E.g. replace a node by its children). Returning an empty array will delete.
  - This feature is also provided by `unist-util-flatmap` and `unist-util-reduce`.
- Also exported a `mapAsync` that supports async function.

## Related

- [`unist-util-map`](https://github.com/syntax-tree/unist-util-map) — create a new tree with all nodes mapped by a given function
- [`unist-util-reduce`](https://github.com/GenerousLabs/unist-util-reduce) - recursively reduce a tree
- [`unist-util-flatmap`](https://gitlab.com/staltz/unist-util-flatmap) — create a new tree by expanding a node into many
- [`unist-util-filter`](https://github.com/syntax-tree/unist-util-filter) — create a new tree with all nodes that pass the given function
- [`unist-util-remove`](https://github.com/syntax-tree/unist-util-remove) — remove nodes from trees
- [`unist-util-select`](https://github.com/syntax-tree/unist-util-select) — select nodes with CSS-like selectors
- [`unist-util-visit`](https://github.com/syntax-tree/unist-util-visit) — walk trees
- [`unist-builder`](https://github.com/syntax-tree/unist-builder) — create trees
