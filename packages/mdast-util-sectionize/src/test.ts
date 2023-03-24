import type { Root } from 'mdast';
import { read } from 'to-vfile';
import { unified } from 'unified';
import { fileURLToPath } from 'node:url';
import remarkParse from 'remark-parse';
import { sectionize } from './index.js';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeFormat from 'rehype-format';

import test from 'node:test';
import assert from 'node:assert/strict';

void test('sectionize', async function () {
  const file = await unified()
    .use(remarkParse)
    .use(myWrapperPlugin)
    .use(remarkRehype)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(await read(fileURLToPath(new URL('../example.md', import.meta.url))));

  function myWrapperPlugin() {
    return (tree: Root) => {
      sectionize(tree, { wrapContent: true });
    };
  }
  assert.equal(
    String(file),
    String(await read(fileURLToPath(new URL('../example.html', import.meta.url))))
  );
});
