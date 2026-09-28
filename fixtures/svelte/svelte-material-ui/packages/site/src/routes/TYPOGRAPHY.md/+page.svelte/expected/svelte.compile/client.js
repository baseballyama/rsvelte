import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Typography from '../../../../../TYPOGRAPHY.md';

var root = $.from_html(`<section class="markdown svelte-1m19mmx"><!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1m19mmx', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Typography - SMUI';
		});
	});

	var node = $.child(section);

	Typography(node, {});
	$.reset(section);
	$.append($$anchor, section);
}