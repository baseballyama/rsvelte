import * as $ from 'svelte/internal/server';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetRestPropsButton_test($$renderer) {
	const props = {
		type: "inline",
		code: "inline code",
		"data-testid": "snippet-rest-btn"
	};

	CodeSnippet($$renderer, $.spread_props([props]));
}