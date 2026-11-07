import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";
import Checkmark from "carbon-icons-svelte/lib/Checkmark.svelte";

export default function CodeSnippetCopyButton_test($$anchor) {
	CodeSnippet($$anchor, {
		type: 'single',
		code: 'npm install --save @carbon/icons',
		get feedbackIcon() {
			return Checkmark;
		}
	});
}