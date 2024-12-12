import { extractJsDocTag, extractTagsFromText } from "./utils";

describe('Unit testing utils', () => {
  describe('extractJsDocTag', () => {
    it('Should extract tags from text', () => {
      const text = `
      /**
       * @tag1 value1
       * @tag2 value2
       */
      export const a = 1;
    `;
      expect(extractJsDocTag(text, 'tag2')).toBe('value2');
    });
    it('Should return undefined if tag is not found', () => {
      const text = `
      /**
       * @tag1 value1
       * @tag2 value2
       */
      export const a = 1;
    `;
      expect(extractJsDocTag(text, 'tag3')).toBeUndefined();
    });
    it('Should return first tag value if multiple tags are found', () => {
      const text = `
      /**
       * @tag1 value1
       * @tag2 value2
       * @tag1 value3
       */
      export const a = 1;
    `;
      expect(extractJsDocTag(text, 'tag1')).toBe('value1');
    });
  });
  describe('extractJsDocTag', () => {
    it('Should extract tags from text', () => {
      const text = `
      /**
       * @tag1 value1
       * @tag2 value2
       */
      export const a = 1;
    `;
      expect(extractTagsFromText(text, ['tag2', 'tag3'])).toMatchObject([{ tagName: 'tag2', value: 'value2' }]);
    });
    it('Should extract tags from multiple comments', () => {
      const text = `
      /**
       * @tag1 value1
       * @tag2 value2
       */
      /**
       * @tag3 value3
       */
      export const a = 1;
    `;
      expect(extractTagsFromText(text, ['tag1', 'tag3'])).toMatchObject([{ tagName: 'tag1', value: 'value1' }, { tagName: 'tag3', value: 'value3' }]);
    });
    it('Should return empty array if no tags are found', () => {
      const text = `
      /**
       * @tag1 value1
       * @tag2 value2
       */
      export const a = 1;
    `;
      expect(extractTagsFromText(text, ['tag3'])).toMatchObject([]);
    });
  });
});