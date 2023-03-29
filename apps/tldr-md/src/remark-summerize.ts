import { Plugin } from 'unified';
import { Root, Heading, Content } from 'mdast';
import { toMarkdown } from 'mdast-util-to-markdown';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { u } from 'unist-builder';
import {
  Summarizer,
  ConfigurationParameters as SummarizerConfigurationParameters,
} from './gpt-summarizer.js';
import { inspect } from 'unist-util-inspect';
import { mapAsync, InclusiveDescendant } from 'unist-util-map-postorder';
import { isSection, splitContents, wait } from './utils.js';
import { Section, WrappedContent, WrappedRoot } from 'mdast-util-sectionize';
import { select, selectAll } from 'unist-util-select';

export interface Configuration extends SummarizerConfigurationParameters {
  maxDepth?: number;
  delay?: number;
}

export const remarkSummarize: Plugin<Configuration[], WrappedRoot, Root> = function (
  config: Configuration
) {
  config = { maxDepth: 2, delay: 5000, ...config };
  const summarizer = new Summarizer(config);

  async function summarizeContents(contents: Content[], heading?: string): Promise<Content[]> {
    const groups: Content[][] = splitContents(contents, summarizer.inputLimit);
    const res: Content[] = [];
    for (const group of groups) {
      res.push(
        ...fromMarkdown(await summarizer.summarize(toMarkdown(u('root', group)), heading)).children
      );
      await wait(config.delay ?? 0);
    }
    return res;
  }

  function transformer(root: WrappedRoot) {
    console.log(inspect(root));
    return mapAsync(root, async (node: InclusiveDescendant<WrappedRoot>) => {
      if (isSection(node)) {
        const heading = select('section > heading', node) as Heading | null;
        const headingString = (heading && toMarkdown(heading)) ?? undefined;
        const ownConent = select('section > div', node) as WrappedContent | null;
        const subsections = selectAll('section > section', node) as Section[];
        const summarized: Content[] = [];
        console.log('Summarizing ' + (headingString ?? ''));

        if (ownConent) {
          summarized.push(...(await summarizeContents(ownConent.children, headingString)));
        }
        if (subsections.length) {
          // if (node.depth <= config.maxDepth!) {
          summarized.push(...(subsections.flatMap((section) => section.children) as Content[]));
          // } else {
          //   for (const subsection of subsections) {
          //     summarized.push(
          //       ...(await summarizeContents(
          //         // In postorder traversal, so there is no deeper subsection
          //         subsection.children as Content[],
          //         headingString
          //       ))
          //     );
          //   }
          // }
        }
        if (heading) {
          if (node.depth <= config.maxDepth!) {
            summarized.unshift(heading);
          }
        }
        if (node.depth === 1) {
          return summarized.filter((o) => o !== null && o !== undefined);
        } else {
          return u(
            'section',
            summarized.filter((o) => o !== null && o !== undefined)
          );
        }
      } else {
        return node;
      }
    });
  }

  return transformer;
};
