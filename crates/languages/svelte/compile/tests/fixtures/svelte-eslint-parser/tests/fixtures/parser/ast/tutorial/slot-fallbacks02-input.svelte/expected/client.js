import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<em>no content was provided</em>`);
var root_1 = $.from_html(`<div class="box svelte-1tfoi6s"><!></div>`);

export default function Slot_fallbacks02_input($$anchor, $$props) {
	var div = root_1();
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var em = root();

		$.append($$anchor, em);
	});

	$.reset(div);
	$.append($$anchor, div);
}