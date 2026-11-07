import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetRestPropsButton_test($$anchor) {
	const props = {
		type: "inline",
		code: "inline code",
		"data-testid": "snippet-rest-btn"
	};

	CodeSnippet($$anchor, $.spread_props(() => props));
}