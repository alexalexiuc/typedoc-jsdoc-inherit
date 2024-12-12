# Typedoc JSDoc Inherit Plugin

A Typedoc plugin to propagate JSDoc tags to re-exported reflections.

## Installation
```bash
npm install --save-dev typedoc-jsdoc-inherit
```

## Usage
Add the plugin to your Typedoc configuration file, and a property `inheritTags` with an array of tags to propagate.

```json
{
  "plugins": ["typedoc-jsdoc-inherit"],
  "inheritTags": ["example"]
}
```

## Features
- Propagate JSDoc tags to re-exported reflections.
- Support for multiple tags.

## Inspiration
When working with TypeScript, it is common to use re-exports to organize your code. However, Typedoc does not propagate JSDoc tags to re-exported reflections. This plugin aims to solve this issue.
For example, consider the following code:

```typescript
// index.ts
/**
 * @category foo
 */
export * from './foo';

// foo.ts
/**
 * This is a foo function.
 */
export function foo() {
  return 'foo';
}

export function bar() {
  return 'bar';
}
```

When generating documentation with Typedoc, the `foo` function will have the `@category foo` tag, but the `bar` function will not. This plugin propagates the `@category foo` tag to the `bar` function as well.
Usually, you may have many re-exported objects, and it is not practical to propagate the tags manually. This plugin automates this process.

