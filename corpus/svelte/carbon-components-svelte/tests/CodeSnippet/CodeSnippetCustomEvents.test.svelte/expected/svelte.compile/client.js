import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeSnippet from "carbon-components-svelte/CodeSnippet/CodeSnippet.svelte";

var root = $.from_html(` <!>`, 1);

export default function CodeSnippetCustomEvents_test($$anchor) {
	let copyCount = 0;

	function handleCopy() {
		copyCount += 1;
	}

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var node = $.sibling(text);

	CodeSnippet(node, {
		type: 'single',
		code: 'npm install --save @carbon/icons',
		$$events: { copy: handleCopy }
	});

	$.template_effect(() => $.set_text(text, `Copy events: ${copyCount ?? ''} `));
	$.append($$anchor, fragment);
}