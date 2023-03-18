// https://github.com/syntax-tree/unist-util-map/blob/main/lib/index.js
// The MIT License (MIT) Copyright (c) 2016 azu
// https://github.com/GenerousLabs/unist-util-reduce/blob/master/src/index.ts
// The MIT License (MIT) Copyright (c) 2015 Eugene Sharygin
// https://gitlab.com/staltz/unist-util-flatmap/-/blob/master/index.js
// The MIT License (MIT) Copyright (c) 2018 Andre 'Staltz' Medeiros

import type { Node, Parent } from 'unist';

export type MapFunction<T extends Node> = (node: T, index?: number, parent?: Parent) => T | T[];

const isParent = (node: Node): node is Parent => {
  return 'children' in node;
};

export function map<T extends Node>(tree: T, mapFunction: MapFunction<T>): T {
  const postorder: MapFunction<T> = function postorder(node, index, parent) {
    if (isParent(node)) {
      const mappedChildren = node.children.flatMap((child, index) =>
        postorder(child as T, index, node)
      );
      const nodeToBeMapped: T = { ...node, children: mappedChildren };
      return mapFunction(nodeToBeMapped, index, parent);
    } else {
      return mapFunction({ ...node }, index, parent);
    }
  };

  const mappedTree = postorder(tree);
  return Array.isArray(mappedTree) ? mappedTree[0] : mappedTree;
}

export type MapAsyncFunction<T extends Node> = (
  node: T,
  index?: number,
  parent?: Parent
) => T | T[] | Promise<T | T[]>;

export async function mapAsync<T extends Node>(
  tree: T,
  mapFunction: MapAsyncFunction<T>
): Promise<T> {
  const postorder: MapAsyncFunction<T> = async function postorder(node, index, parent) {
    if (isParent(node)) {
      let mappedChildren: (T | T[])[] = [];
      for (const [index, child] of node.children.entries()) {
        const mappedChild = await postorder(child as T, index, node);
        mappedChildren.push(mappedChild);
      }
      mappedChildren = mappedChildren.flat() as T[];
      const nodeToBeMapped: T = { ...node, children: mappedChildren.flat() };
      return await mapFunction(nodeToBeMapped, index, parent);
    } else {
      const nodeToBeMapped: T = { ...node };
      return await mapFunction(nodeToBeMapped, index, parent);
    }
  };

  const mappedTree = await postorder(tree);
  return Array.isArray(mappedTree) ? mappedTree[0] : mappedTree;
}
