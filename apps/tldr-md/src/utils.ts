import { Section, WrappedContent } from 'mdast-util-sectionize';
import { convert } from 'unist-util-is';
import { encode } from 'gpt-3-encoder';
import { toMarkdown } from 'mdast-util-to-markdown';
import { Content } from 'mdast';

export const isSection = convert<Section>('section');

export const isWrappedContent = convert<WrappedContent>('div');

export const isContent = convert<Content>(
  (node): node is Content => !isSection(node) && !isWrappedContent(node)
);

export function countTokens(str: string): number {
  return encode(str).length;
}

export function splitContents(contents: Content[], limit: number): Content[][] {
  const chunks: Content[][] = [[]];
  let i = 0;
  let current = 0;
  for (const content of contents) {
    const tokenCount = countTokens(toMarkdown(content));
    if (current + tokenCount <= limit) {
      chunks[i] = [...(chunks[i] ?? []), content];
      current += tokenCount;
    } else if (tokenCount <= limit) {
      chunks[i + 1] = [content];
      i += 1;
      current = tokenCount;
    } else if (current === 0) {
      chunks[i] = [content];
      i += 1;
    } else {
      chunks[i + 1] = [content];
      i += 2;
      current = 0;
    }
  }
  return chunks;
}

export function wait(delay: number) {
  return new Promise((res) => {
    setTimeout(res, delay);
  });
}
