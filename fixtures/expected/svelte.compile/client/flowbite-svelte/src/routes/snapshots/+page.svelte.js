import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "$lib";

var root = $.from_html(`<div class="h-[500px]"><!></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	P(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Use Back button on your browser');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}