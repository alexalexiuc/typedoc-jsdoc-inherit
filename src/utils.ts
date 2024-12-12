import ts from "typescript";
import { TagInfo } from "./types";

export function extractJsDocTag(comment: string, tagName: string): string | undefined {
  // Remove the comment delimiters /** ... */
  const cleanComment = comment
    .replace(/^\/\*\*/, '')
    .replace(/\*\/$/, '')
    .split('\n')
    .map(line => line.trim().replace(/^\* ?/, ''))
    .join('\n');

  const lines = cleanComment.split('\n');

  for (const line of lines) {
    if (line.startsWith(`@${tagName}`)) {
      const match = line.match(new RegExp(`@${tagName}\\s+(.*)`));
      return match?.[1]?.trim();
    }
  }

  return undefined;
}

const isJsDocReg = /^\s*\/\*\*[\s\S]*\*\//;

export function extractTagsFromText(text: string, tags: string[]): TagInfo[] {
  const leadingCommentRanges = ts.getLeadingCommentRanges(text, 0);
  const comments = leadingCommentRanges?.map(c => text.substring(c.pos, c.end)) || [];
  // first verify if comment has tag and comment is a jsDoc
  // build regex to match tags
  const foundTags: TagInfo[] = [];
  const tagRegex = new RegExp(`@(${tags.join('|')})`);
  for (const tag of tags) {
    // if comment does not include tag, we can skip it
    if (!tagRegex.test(text)) {
      continue;
    }
    const tagInfo: TagInfo = { tagName: tag, value: '' };
    for (const comment of comments) {
      if (isJsDocReg.test(comment)) {
        const value = extractJsDocTag(comment, tag);
        if (value) {
          tagInfo.value = value;
          // we only consider first encounter of tag
          continue;
        }
      }
    }
    if(tagInfo.value) {
      foundTags.push(tagInfo);
    }
  }

  return foundTags;
}