import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Snippet } from '$lib/components/ui/snippet';

var root = $.from_html(`<div class="flex w-full max-w-[300px] flex-col gap-2"><!> <!> <!> <!></div>`);

export default function Snippet_variants($$anchor) {
	var div = root();
	var node = $.child(div);

	Snippet(node, { text: 'npx jsrepo add ui/snippet' });

	var node_1 = $.sibling(node, 2);

	Snippet(node_1, { variant: 'primary', text: 'npx jsrepo add ui/snippet' });

	var node_2 = $.sibling(node_1, 2);

	Snippet(node_2, { variant: 'secondary', text: 'npx jsrepo add ui/snippet' });

	var node_3 = $.sibling(node_2, 2);

	Snippet(node_3, { variant: 'destructive', text: 'npx jsrepo add ui/snippet' });
	$.reset(div);
	$.append($$anchor, div);
}