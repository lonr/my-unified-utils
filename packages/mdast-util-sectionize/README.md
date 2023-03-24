# mdast-util-sectionize

[mdast](https://github.com/syntax-tree/mdast) util to wrap each heading and the content that follows it (including its subheading and their content) in a `<section>` tag. A similar package, [`remark-sectionize`](https://github.com/jake-low/remark-sectionize) does the same.

Optional, it can also wrap the content of the heading itself in a `<div>` tag.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). In Node.js, install with [npm](https://docs.npmjs.com/cli/install):

```shell
npm install mdast-util-sectionize
```

## Use

```md
# Example

Intro of h1

## h2-1

Intro of h2-1

### h3-1

Content of h3-1

## h2-2

Content of h2-2
```

…and a module `example.ts`:

```ts
import type { Root } from 'mdast';
import { read } from 'to-vfile';
import { unified } from 'unified';
import { fileURLToPath } from 'node:url';
import remarkParse from 'remark-parse';
import { sectionize } from 'mdast-util-sectionize';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeFormat from 'rehype-format';

const file = await unified()
  .use(remarkParse)
  .use(myWrapperPlugin)
  .use(remarkRehype)
  .use(rehypeFormat)
  .use(rehypeStringify)
  .process(await read(fileURLToPath(new URL('./example.md', import.meta.url))));

console.log(String(file));

function myWrapperPlugin() {
  return (tree: Root) => {
    sectionize(tree, { wrapContent: true });
  };
}
```

Yields:

```html
<section>
  <h1>Example</h1>
  <div><p>Intro of h1</p></div>
  <section>
    <h2>h2-1</h2>
    <div><p>Intro of h2-1</p></div>
    <section>
      <h3>h3-1</h3>
      <div><p>Content of h3-1</p></div>
    </section>
  </section>
  <section>
    <h2>h2-2</h2>
    <div><p>Content of h2-2</p></div>
  </section>
</section>
```

## Related

- [`remark-sectionize`](https://github.com/jake-low/remark-sectionize) — Remark plugin to wrap each heading and the content that follows it in a `<section>` tag
- [`mdast-util-heading-range`](https://github.com/syntax-tree/mdast-util-heading-range) — utility to use headings as ranges in mdast
- [`mdast-zone`](https://github.com/syntax-tree/mdast-zone) — utility to treat HTML comments as ranges or markers in mdast
