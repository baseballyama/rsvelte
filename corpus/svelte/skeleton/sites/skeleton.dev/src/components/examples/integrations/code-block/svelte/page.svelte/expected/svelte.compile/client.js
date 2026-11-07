import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeBlock from './code-block.svelte';

var root = $.from_html(`<div class="p-10 space-y-4"><!> <!> <!> <!></div>`);

export default function Page($$anchor) {
	var div = root();
	var node = $.child(div);

	CodeBlock(node, { code: 'npx sv create my-skeleton-app', lang: 'bash' });

	var node_1 = $.sibling(node, 2);

	CodeBlock(node_1, { code: '<div class="bg-green-500"', lang: 'html' });

	var node_2 = $.sibling(node_1, 2);

	CodeBlock(node_2, { code: '.foobar { background: green; }', lang: 'css' });

	var node_3 = $.sibling(node_2, 2);

	CodeBlock(node_3, { code: 'const foot = \'bar\';', lang: 'js' });
	$.reset(div);
	$.append($$anchor, div);
}