import { createSorter } from 'prettier-plugin-tailwindcss/sorter';
import fs from 'node:fs';

const input = JSON.parse(fs.readFileSync(0, 'utf8')); // array of class strings (space-separated)
const sorter = await createSorter({
  base: process.cwd(),
  stylesheetPath: process.argv[2] || 'default.css',
  preserveDuplicates: false,
});
const out = sorter.sortClassAttributes(input);
process.stdout.write(JSON.stringify(out));
