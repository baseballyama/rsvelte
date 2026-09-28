import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Migrating from '../../../../../MIGRATING.md';

var root = $.from_html(`<section class="markdown svelte-bimf98"><!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('bimf98', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Migrating - SMUI';
		});
	});

	var node = $.child(section);

	Migrating(node, {});
	$.reset(section);
	$.append($$anchor, section);
}