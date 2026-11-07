import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetRestPropsSingle_test($$anchor) {
	const props = {
		type: "single",
		code: "single line",
		"data-testid": "snippet-rest-div"
	};

	CodeSnippet($$anchor, $.spread_props(() => props));
}