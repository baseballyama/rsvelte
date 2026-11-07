import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Theming from '../../../../../THEMING.md';

var root = $.from_html(`<section class="markdown svelte-17ool58"><!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('17ool58', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Theming - SMUI';
		});
	});

	var node = $.child(section);

	Theming(node, {});
	$.reset(section);
	$.append($$anchor, section);
}