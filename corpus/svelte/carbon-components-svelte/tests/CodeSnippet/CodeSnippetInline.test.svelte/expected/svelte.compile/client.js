import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetInline_test($$anchor) {
	CodeSnippet($$anchor, { type: 'inline', code: 'npm install -g @carbon/cli' });
}