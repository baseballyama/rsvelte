import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

export default function CodeSnippetRestPropsSpan_test($$anchor) {
	const props = {
		type: "inline",
		hideCopyButton: true,
		code: "inline code",
		"data-testid": "snippet-rest-span"
	};

	CodeSnippet($$anchor, $.spread_props(() => props));
}