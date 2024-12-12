import { Application, Comment, CommentTag, Context, Converter, ParameterType, ReflectionKind } from 'typedoc';
import ts from 'typescript';
import { ReexportedReflectionsInfo, ReexportFileInfo } from './types';
import { extractTagsFromText } from './utils';

const pluginPropName = 'passDownTags';

export function load(app: Application) {
  app.options.addDeclaration({
    name: pluginPropName,
    help: 'An array of tags to be passed down to reexports',
    type: ParameterType.Array,
  });

  // Store category tags found in files so we can apply them later.
  const reexportedReflections: ReexportedReflectionsInfo = {};

  app.converter.on(Converter.EVENT_BEGIN, (context: Context) => {
    const reexportFileInfo: ReexportFileInfo[] = [];
    const optionValue = app.options.getValue(pluginPropName) as string[] | undefined;
    if(!optionValue || !Array.isArray(optionValue) || optionValue.length === 0) {
      app.logger.error(`Set property ${pluginPropName} in typedoc.json`);
      return;
    }
    app.logger.info(`Tags to pass down to reexports: ${optionValue}`);
    for(const program of context.programs) {
      const sourceFiles = program.getSourceFiles();
      const checker = program.getTypeChecker();
      for(const sourceFile of sourceFiles) {
        if (
          !program.isSourceFileFromExternalLibrary(sourceFile)
          && sourceFile.fileName.endsWith('index.ts')
        ) {

          const text = sourceFile.getFullText();
          const foundTags = extractTagsFromText(text, optionValue);

          const file: ReexportFileInfo = {
            filePath: sourceFile.fileName,
            fileTags: foundTags,
            fileReexports: [],
          };

          for(const statement of sourceFile.statements) {
            const isExport = statement.kind === ts.SyntaxKind.ExportDeclaration;
            if(!isExport) {
              continue;
            }

            const moduleSpecifier = (statement as ts.ExportDeclaration).moduleSpecifier;

            if (!moduleSpecifier) {
              continue;
            }
            const moduleSymbol = checker.getSymbolAtLocation(moduleSpecifier);
            if(!moduleSymbol) {
              continue;
            }

            const exports = checker.getExportsOfModule(moduleSymbol);

            for(const ex of exports) {
              const name = ex.getName();
              file.fileReexports.push(name);
            }
          }
          if(file.fileTags.length > 0) {
            reexportFileInfo.push(file);
          }
        }
      }
    }

    // if we have files that reexport and these files contain tags we were looking for, we will create a reversed map
    // with reflections as keys and tags
    for(const file of reexportFileInfo) {
      for(const reexport of file.fileReexports) {
        for(const tag of file.fileTags) {
          // if reexport already has the tag, it means it was already set by a more nested file(nearer to the reexport, so we will prioritize it)
          if(!reexportedReflections[reexport] || !reexportedReflections[reexport][tag.tagName]) {
            reexportedReflections[reexport] = {
              ...reexportedReflections[reexport],
              [tag.tagName]: tag.value,
            };
          }
        }
      }
    }
  });


  app.converter.on(Converter.EVENT_RESOLVE_END, (context) => {
    if(Object.keys(reexportedReflections).length === 0) {
      return;
    }
    const reflections = context.project.reflections;
    // List of reflections that have already been verified to add the tag
    const reflectionTraversed: string[] = [];
    const reflectionKindsToSkip = [ReflectionKind.CallSignature];
    for (const key in reflections) {
      const reflection = reflections[key];
      if(reflectionKindsToSkip.includes(reflection.kind) || reflectionTraversed.includes(reflection.name)) {
        continue;
      }
      const tagsForReflection = reexportedReflections[reflection.name];
      if (tagsForReflection) {
        // Ensure the reflection has a comment object, if no, create one
        if (!reflection.hasComment()) {
          reflection.comment = new Comment([], []);
        }

        // Apply tags to the reflection
        for (const [tagName, tagValue] of Object.entries(tagsForReflection)) {
          // if tag already exists, we do not override it
          if (!reflection.comment?.hasModifier(`@${tagName}`)) {
            reflection.comment!.blockTags.push(new CommentTag(`@${tagName}`, [{ kind: 'text', text: tagValue }]));
          }
          reflectionTraversed.push(reflection.name);
        }
      }
    }
  });
}