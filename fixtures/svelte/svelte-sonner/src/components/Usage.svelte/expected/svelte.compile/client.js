import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeBlock from './CodeBlock.svelte';
import { usageSnippet } from './code-snippets.js';

var root = $.from_html(`<div><h2>Usage</h2> <p>Render the toaster in the root of your app.</p> <!></div>`);

export default function Usage($$anchor) {
	var div = root();
	var node = $.sibling($.child(div), 4);

	CodeBlock(node, {
		get code() {
			return usageSnippet;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
}