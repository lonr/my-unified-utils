import { Node, Parent } from 'unist';
import { Root, Heading, Content } from 'mdast';
import { convert, Test } from 'unist-util-is';
import { findAfter } from 'unist-util-find-after';
import { u } from 'unist-builder';

const isHeading = convert<Heading>('heading');

export interface WrappedContent {
  type: 'div';
  children: Content[];
}

export interface Section {
  type: 'section';
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  children: (Content | WrappedContent | Section)[];
}

export interface WrappedRoot {
  type: 'root';
  children: Section[];
}

// like remark-sectionize. Can optional wrap the content of the Header itself(not its children) with a div node
export function sectionize(root: Root, options = { wrapContent: false }) {
  function wrap(parent: Root | Section, depth: number) {
    const children = parent.children;
    const wrappedChildren: (Section | WrappedContent | Content)[] = [];
    let i = 0;
    while (i < children.length) {
      const child = children[i];
      if (isHeading(child) && child.depth > depth) {
        if (options.wrapContent) {
          // find a heading that ends the content
          const contentEndIndex = findIndexAfter(parent, i, 'heading');
          const contentLength = contentEndIndex - (i + 1);
          if (contentLength > 0) {
            const wrappedContent = u(
              'div',
              { data: { hName: 'div' } },
              children.slice(i + 1, contentEndIndex)
            ) as WrappedContent;
            children.splice(i + 1, contentLength, wrappedContent);
          }
        }
        const sectionEndIndex = findIndexAfter(
          parent,
          i,
          (node) => isHeading(node) && node.depth <= child.depth
        );
        const section = u(
          'section',
          { depth: child.depth, data: { hName: 'section' } },
          children.slice(i, sectionEndIndex)
        );
        wrap(section, child.depth);
        wrappedChildren.push(section);
        i = sectionEndIndex;
      } else {
        wrappedChildren.push(child as Content);
        i += 1;
      }
    }
    parent.children = wrappedChildren;
  }

  wrap(root, 0);
}

function findIndexAfter(parent: Parent, index: Node | number, test: Test): number {
  const found = findAfter(parent, index, test);
  if (found) {
    return parent.children.indexOf(found);
  } else {
    return parent.children.length;
  }
}
