import { describe, expect, it } from 'vitest';
import { parseModuleDoc } from '../scripts/generate-docs.mjs';

describe('docs generator', () => {
  it('extracts module name and description', () => {
    const src = '/**\n * Does things.\n * Nicely.\n * @module Thing\n */\nexport const x = 1;';
    expect(parseModuleDoc(src)).toEqual({ name: 'Thing', description: 'Does things.\nNicely.' });
  });

  it('ignores files without @module', () => {
    expect(parseModuleDoc('/** just a comment */')).toBeNull();
  });
});
