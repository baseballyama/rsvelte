import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Link } from '$lib/components/ui/link';

var root = $.from_html(`<p class="text-center">Crafted by <!>, enhanced by <!>.</p>`);

export default function Link_1($$anchor) {
	var p = root();
	var node = $.sibling($.child(p));

	Link(node, {
		href: 'https://github.com/huntabyte',
		target: '_blank',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('huntabyte');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Link(node_1, {
		href: 'https://github.com/ieedan',
		target: '_blank',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('ieedan');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(p);
	$.append($$anchor, p);
}