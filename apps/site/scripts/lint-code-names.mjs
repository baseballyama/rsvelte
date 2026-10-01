import { checkCodeNames } from './code-names.mjs';
import path from 'node:path';

const result = checkCodeNames(path.resolve(import.meta.dirname, '../../..'));
for (const error of result.errors) console.error(error);
console.log(`Checked names in ${result.files} source files; ${result.errors.length} errors.`);
process.exitCode = result.errors.length ? 1 : 0;
