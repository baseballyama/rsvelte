import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetWithCustomCopyText_test($$anchor) {
	CodeSnippet($$anchor, {
		type: 'single',
		code: 'npm install --save @carbon/icons',
		feedback: 'Custom copied text!'
	});
}