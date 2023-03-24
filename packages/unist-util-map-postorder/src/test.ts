// https://github.com/syntax-tree/unist-util-map/blob/main/test.js
// MIT License Copyright (c) 2016 azu
import test from 'node:test';
import assert from 'node:assert/strict';
import { u } from 'unist-builder';
import * as mod from './index.js';
import { map, mapAsync } from './index.js';

type Leaf = {
  type: 'leaf';
  value: string;
};

type Node = {
  type: 'node';
  children: Array<Node | Leaf>;
};

type Root = {
  type: 'root';
  children: Array<Node | Leaf>;
};

type AnyNode = Root | Node | Leaf;

void test('map', function () {
  assert.deepEqual(Object.keys(mod).sort(), ['map', 'mapAsync'], 'should expose the public api');

  const rootA: Root = u('root', [u('node', [u('leaf', '1')]), u('leaf', '2')]);
  assert.deepEqual(
    map(rootA, changeLeaf),
    u('root', [u('node', [u('leaf', 'CHANGED')]), u('leaf', 'CHANGED')]),
    'should map the specified node'
  );

  const rootB: Root = {
    type: 'root',
    children: [
      { type: 'node', children: [{ type: 'leaf', value: '1' }] },
      { type: 'leaf', value: '2' },
    ],
  };
  assert.deepEqual(
    map(rootB, changeLeaf),
    u('root', [u('node', [u('leaf', 'CHANGED')]), u('leaf', 'CHANGED')]),
    'should map the specified node'
  );

  // const rootC: Root = u('root', [u('node', [u('leaf', '1')]), u('leaf', '2')]);
  // assert.deepEqual(
  //   // @ts-expect-error: invalid:
  //   map(rootC, nullLeaf),
  //   // @ts-expect-error: not valid but tested anyway.
  //   u('root', [u('node', [{}]), {}]),
  //   'should work when retuning an empty object'
  // );

  const rootD: Root = u('root', [u('node', [u('leaf', '1')]), u('leaf', '2')]);
  assert.deepEqual(
    map(rootD, emptyLeaf),
    u('root', [u('node', [])]),
    'should work when retuning an empty array'
  );

  assert.deepEqual(
    // @ts-expect-error runtime.
    map({}, addValue),
    { value: 'test' },
    'should work when passing an empty object'
  );

  const tree: Root = u('root', [u('node', [u('leaf', '1')]), u('leaf', '2')]);

  assert.deepEqual(map(tree, asIs), tree, 'should support an explicitly typed `MapFunction`');
});

function changeLeaf(node: AnyNode): AnyNode {
  return node.type === 'leaf' ? Object.assign({}, node, { value: 'CHANGED' }) : node;
}

// function nullLeaf(node: AnyNode): Root | Node | null {
//   return node.type === 'leaf' ? null : node;
// }

function emptyLeaf(node: AnyNode): Root | Node | [] {
  return node.type === 'leaf' ? [] : node;
}

function addValue() {
  return { value: 'test' };
}

function asIs(node: AnyNode): AnyNode {
  return node;
}

void test('mapAsync', async function () {
  const rootA: Root = u('root', [u('node', [u('leaf', '1')]), u('leaf', '2')]);
  assert.deepEqual(
    await mapAsync(rootA, changeLeafAsync),
    u('root', [u('node', [u('leaf', 'CHANGED')]), u('leaf', 'CHANGED')]),
    'should map the specified node'
  );

  const rootA1: Root = u('root', [u('node', [u('leaf', '1')]), u('leaf', '2')]);
  assert.deepEqual(
    await mapAsync(rootA1, changeLeaf),
    u('root', [u('node', [u('leaf', 'CHANGED')]), u('leaf', 'CHANGED')]),
    'should map the specified node. Should work when passing a sync map function'
  );

  const rootB: Root = {
    type: 'root',
    children: [
      { type: 'node', children: [{ type: 'leaf', value: '1' }] },
      { type: 'leaf', value: '2' },
    ],
  };
  assert.deepEqual(
    await mapAsync(rootB, changeLeafAsync),
    u('root', [u('node', [u('leaf', 'CHANGED')]), u('leaf', 'CHANGED')]),
    'should map the specified node'
  );

  // const rootC: Root = u('root', [u('node', [u('leaf', '1')]), u('leaf', '2')]);
  // assert.deepEqual(
  //   // @ts-expect-error: invalid:
  //   map(rootC, nullLeaf),
  //   // @ts-expect-error: not valid but tested anyway.
  //   u('root', [u('node', [{}]), {}]),
  //   'should work when retuning an empty object'
  // );

  const rootD: Root = u('root', [u('node', [u('leaf', '1')]), u('leaf', '2')]);
  assert.deepEqual(
    await mapAsync(rootD, emptyLeafAsync),
    u('root', [u('node', [])]),
    'should work when retuning an empty array'
  );

  assert.deepEqual(
    // @ts-expect-error runtime.
    await mapAsync({}, addValueAsync),
    { value: 'test' },
    'should work when passing an empty object'
  );

  const tree: Root = u('root', [u('node', [u('leaf', '1')]), u('leaf', '2')]);

  assert.deepEqual(
    await mapAsync(tree, asIsAsync),
    tree,
    'should support an explicitly typed `MapAsyncFunction`'
  );
});

/* eslint-disable @typescript-eslint/require-await */

async function changeLeafAsync(node: AnyNode): Promise<AnyNode> {
  return node.type === 'leaf' ? Object.assign({}, node, { value: 'CHANGED' }) : node;
}

// function nullLeaf(node: AnyNode): Root | Node | null {
//   return node.type === 'leaf' ? null : node;
// }

async function emptyLeafAsync(node: AnyNode): Promise<Root | Node | []> {
  return node.type === 'leaf' ? [] : node;
}

async function addValueAsync() {
  return { value: 'test' };
}

async function asIsAsync(node: AnyNode): Promise<AnyNode> {
  return node;
}
