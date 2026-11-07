import * as $ from 'svelte/internal/server';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";
import Checkmark from "carbon-icons-svelte/lib/Checkmark.svelte";

export default function CodeSnippetCopyButton_test($$renderer) {
	CodeSnippet($$renderer, {
		type: 'single',
		code: 'npm install --save @carbon/icons',
		feedbackIcon: Checkmark
	});
}