import * as $ from 'svelte/internal/server';
import CodeBlock from './CodeBlock.svelte';
import { usageSnippet } from './code-snippets.js';

export default function Usage($$renderer) {
	$$renderer.push(`<div><h2>Usage</h2> <p>Render the toaster in the root of your app.</p> `);
	CodeBlock($$renderer, { code: usageSnippet });
	$$renderer.push(`<!----></div>`);
}