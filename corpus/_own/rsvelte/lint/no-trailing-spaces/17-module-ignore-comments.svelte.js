/* eslint svelte/no-trailing-spaces: ["warn", { "ignoreComments": true }] */
// line comment 
/* block 
   interior 
   end */ 
const tpl = `a 
b`;
const s = 'x /* y'; 
const t = 2; 
void [tpl, s, t];
