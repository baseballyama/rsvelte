import * as $ from 'svelte/internal/server';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetRestPropsSpan_test($$renderer) {
	const props = {
		type: "inline",
		hideCopyButton: true,
		code: "inline code",
		"data-testid": "snippet-rest-span"
	};

	CodeSnippet($$renderer, $.spread_props([props]));
}