import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Install from '../../../../../INSTALL.md';

var root = $.from_html(`<section class="markdown svelte-1emavz5"><!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1emavz5', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Installation - SMUI';
		});
	});

	var node = $.child(section);

	Install(node, {});
	$.reset(section);
	$.append($$anchor, section);
}