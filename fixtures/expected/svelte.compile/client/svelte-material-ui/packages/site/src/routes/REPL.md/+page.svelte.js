import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Repl from '../../../../../REPL.md';

var root = $.from_html(`<section class="markdown svelte-1duy9x5"><!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1duy9x5', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'REPL - SMUI';
		});
	});

	var node = $.child(section);

	Repl(node, {});
	$.reset(section);
	$.append($$anchor, section);
}