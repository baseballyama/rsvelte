import * as $ from 'svelte/internal/server';
import CodeBlock from './code-block.svelte';

export default function Page($$renderer) {
	$$renderer.push(`<div class="p-10 space-y-4">`);
	CodeBlock($$renderer, { code: 'npx sv create my-skeleton-app', lang: 'bash' });
	$$renderer.push(`<!----> `);
	CodeBlock($$renderer, { code: '<div class="bg-green-500"', lang: 'html' });
	$$renderer.push(`<!----> `);
	CodeBlock($$renderer, { code: '.foobar { background: green; }', lang: 'css' });
	$$renderer.push(`<!----> `);
	CodeBlock($$renderer, { code: 'const foot = \'bar\';', lang: 'js' });
	$$renderer.push(`<!----></div>`);
}