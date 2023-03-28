import * as openai from 'openai';

type Model = 'gpt-3.5-turbo' | 'text-davinci-003';

export interface Configuration {
  model?: Model;
  topic?: string;
}

export interface ConfigurationParameters extends Configuration, openai.ConfigurationParameters {}

export class Summarizer {
  private config: Configuration;
  private openaiConfig: openai.Configuration;
  private ai: openai.OpenAIApi;
  public inputLimit = 3000;

  constructor(configuration?: ConfigurationParameters) {
    this.config = { ...configuration, model: configuration?.model ?? 'gpt-3.5-turbo' };
    this.openaiConfig = new openai.Configuration(configuration);
    this.ai = new openai.OpenAIApi(this.openaiConfig);
  }

  async summarize(content: string, heading?: string | null): Promise<string> {
    // if (this.config.model === 'text-davinci-003') {
    //   return this.textSummarize(mkd);
    // } else {
    // return this.chatSummarize(mkd);
    // }
    return this.chatSummarize(content, heading);
  }

  private async chatSummarize(content: string, heading?: string | null): Promise<string> {
    const topic = this.config.topic;
    const prompt = `假设你是一个编辑。
    有一篇很长的 Markdown 文章需要处理。
    ${topic ? `这篇文章的主题是“${topic}”。` : ''}
    你将被提供这篇文章的一部分。
    ${heading ? `这部分的标题是“${heading}”。` : ''}
    请你：
    - 缩写提供的部分
    - 提供的部分文章不一定直接得到原文的结论
    - 不需要保留提供的标题`;
    const res = await this.ai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 1,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `\`\`\`\n ${content}\n\`\`\`` },
      ],
    });
    return res.data.choices[0].message!.content;
  }

  // private async chatSummarize(content: string, heading?: string | null): Promise<string> {
  //   const topic = this.config.topic;
  //   const prompt = `Assuming you are an editor. \
  //   There is a long article. \
  //   ${topic ? `The article's theme is "${topic}."` : ''}\
  //   You will be provided with a part of that article in Markdown format. \
  //   ${heading ? `The title of this Markdown section is ${heading}.` : ''} \n\
  //   - Your task is to condense the provided section. \
  //   - Use the language used in the original text, and there is no need for translation.\n`;
  //   const res = await this.ai.createChatCompletion({
  //     model: 'gpt-3.5-turbo',
  //     messages: [
  //       { role: 'system', content: prompt },
  //       { role: 'user', content: `\`\`\`\n ${content}\n\`\`\`` },
  //     ],
  //   });
  //   return res.data.choices[0].message!.content;
  // }

  // private async textSummarize(content: string): Promise<string> {
  //   const res = await this.ai.createCompletion({
  //     model: 'text-davinci-003',
  //     prompt: `Summarize this:\n ${content}`,
  //   });
  //   return res.data.choices[0].text!;
  // }
}
