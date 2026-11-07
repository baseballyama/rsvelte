import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SvelteKit from '../../../../../SVELTEKIT.md';

var root = $.from_html(`<section class="markdown svelte-1axy85z"><!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1axy85z', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'SvelteKit - SMUI';
		});
	});

	var node = $.child(section);

	SvelteKit(node, {});
	$.reset(section);
	$.append($$anchor, section);
}