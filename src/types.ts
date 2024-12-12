/** Object containing tag name and value */
export interface TagInfo {
  tagName: string;
  value: string;
}

/** Info about reflection that is being reexported and what tags it should inherit */
export type ReexportedReflectionsInfo = Record<string, Record<string, string>>;

/** Info about what reflections file re-exports and tags it has */
export interface ReexportFileInfo { filePath: string, fileTags: TagInfo[], fileReexports: string[] }