import { remark } from 'remark';
import { sectionize } from 'mdast-util-sectionize';
import { Root } from 'mdast';
import { remarkSummarize } from './remark-summerize.js';
import { read } from 'to-vfile';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY not found');
}

const apiKey = process.env.OPENAI_API_KEY;
const topic =
  '本书的前半部分从理论和批判入手，建立了思考的框架，后半部分则以年为单位叙述信贷扩张和干预性政策的恶果如何一步一步的制造了大萧条。本书的后半部分更容易阅读，然而前半部分描述的事实，特别是 20 年代美联储、美国政府的货币政策和引导信贷扩张的策略，才是大萧条真正的原因。';

const file = await remark()
  .use(remarkSectionize)
  .use(remarkSummarize, { apiKey, topic, maxDepth: 3 })
  .process(await read(fileURLToPath(new URL('../example.md', import.meta.url))));

await writeFile(new URL('../output.md', import.meta.url), file.toString());

function remarkSectionize() {
  return (tree: Root) => {
    sectionize(tree, { wrapContent: true });
  };
}
