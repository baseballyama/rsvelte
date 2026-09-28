import * as $ from 'svelte/internal/server';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetMultiline_test($$renderer) {
	CodeSnippet($$renderer, {
		type: 'multi',
		code: `node -v
npm -v
yarn -v`
	});
}