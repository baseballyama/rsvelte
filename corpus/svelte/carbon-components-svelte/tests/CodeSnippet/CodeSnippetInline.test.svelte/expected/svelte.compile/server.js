import * as $ from 'svelte/internal/server';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetInline_test($$renderer) {
	CodeSnippet($$renderer, { type: 'inline', code: 'npm install -g @carbon/cli' });
}