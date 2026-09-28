import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetMultiline_test($$anchor) {
	CodeSnippet($$anchor, {
		type: 'multi',
		code: `node -v
npm -v
yarn -v`
	});
}