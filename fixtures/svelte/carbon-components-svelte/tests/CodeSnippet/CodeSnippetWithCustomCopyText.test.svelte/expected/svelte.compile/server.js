import * as $ from 'svelte/internal/server';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetWithCustomCopyText_test($$renderer) {
	CodeSnippet($$renderer, {
		type: 'single',
		code: 'npm install --save @carbon/icons',
		feedback: 'Custom copied text!'
	});
}