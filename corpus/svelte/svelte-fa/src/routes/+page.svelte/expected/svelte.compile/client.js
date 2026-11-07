import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Showcase from "./showcase.svelte";
import Docs from "./docs.svelte";

var root = $.from_html(`<div class="container my-4"><!> <!></div>`);

export default function _page($$anchor) {
	var div = root();

	$.head('1uha8ag', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'svelte-fa - Tiny FontAwesome component for Svelte';
		});
	});

	var node = $.child(div);

	Showcase(node, {});

	var node_1 = $.sibling(node, 2);

	Docs(node_1, {});
	$.reset(div);
	$.append($$anchor, div);
}