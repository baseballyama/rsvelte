import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function TestNoScript($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);

	$.event('click', div, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, div);
}