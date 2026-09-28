import * as $ from 'svelte/internal/server';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetCustomEvents_test($$renderer) {
	let copyCount = 0;

	function handleCopy() {
		copyCount += 1;
	}

	$$renderer.push(`<!---->Copy events: ${$.escape(copyCount)} `);
	CodeSnippet($$renderer, { type: 'single', code: 'npm install --save @carbon/icons' });
	$$renderer.push(`<!---->`);
}