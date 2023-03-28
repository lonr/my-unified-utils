// https://github.com/syntax-tree/unist-util-map/blob/main/lib/index.js
// The MIT License (MIT) Copyright (c) 2016 azu
// https://github.com/GenerousLabs/unist-util-reduce/blob/master/src/index.ts
// The MIT License (MIT) Copyright (c) 2015 Eugene Sharygin
// https://gitlab.com/staltz/unist-util-flatmap/-/blob/master/index.js
// The MIT License (MIT) Copyright (c) 2018 Andre 'Staltz' Medeiros

import type { Node, Parent } from 'unist';
import { InclusiveDescendant, MapFunction, MapAsyncFunction } from './complex-types.js';
export type { MapFunction, MapAsyncFunction, InclusiveDescendant };

const isParent = (node: Node): node is Parent => {
  return 'children' in node;
};

export function map<T extends Node>(tree: T, mapFunction: MapFunction<T>): InclusiveDescendant<T> {
  const postorder: MapFunction<T> = function postorder(
    node,
    index?,
    parent?
  ): InclusiveDescendant<T> | InclusiveDescendant<T>[] {
    if (isParent(node)) {
      const mappedChildren = node.children.flatMap((child, index) =>
        postorder(child as InclusiveDescendant<T>, index, node)
      );
      const nodeToBeMapped = { ...node, children: mappedChildren };
      return mapFunction(nodeToBeMapped, index, parent);
    } else {
      return mapFunction({ ...node }, index, parent);
    }
  };

  const mappedTree = postorder(tree as InclusiveDescendant<T>);
  return Array.isArray(mappedTree) ? mappedTree[0] : mappedTree;
}

export async function mapAsync<T extends Node>(
  tree: T,
  mapFunction: MapAsyncFunction<T>
): Promise<InclusiveDescendant<T>> {
  const postorder: MapAsyncFunction<T> = async function postorder(node, index?, parent?) {
    if (isParent(node)) {
      let mappedChildren: (Node | Node[])[] = [];
      for (const [index, child] of node.children.entries()) {
        const mappedChild = await postorder(child as InclusiveDescendant<T>, index, node);
        mappedChildren.push(mappedChild);
      }
      const nodeToBeMapped = { ...node, children: mappedChildren.flat() };
      return await mapFunction(nodeToBeMapped, index, parent);
    } else {
      const nodeToBeMapped = { ...node };
      return await mapFunction(nodeToBeMapped, index, parent);
    }
  };

  const mappedTree = await postorder(tree as InclusiveDescendant<T>);
  return Array.isArray(mappedTree) ? mappedTree[0] : mappedTree;
}
