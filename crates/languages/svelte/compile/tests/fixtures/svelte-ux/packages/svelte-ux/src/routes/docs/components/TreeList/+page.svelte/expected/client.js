import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TreeList } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';
import Blockquote from '$docs/Blockquote.svelte';

var root = $.from_html(`<h1>Examples</h1> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	Blockquote(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('TODO');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}