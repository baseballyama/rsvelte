import * as $ from 'svelte/internal/server';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetRestPropsSingle_test($$renderer) {
	const props = {
		type: "single",
		code: "single line",
		"data-testid": "snippet-rest-div"
	};

	CodeSnippet($$renderer, $.spread_props([props]));
}