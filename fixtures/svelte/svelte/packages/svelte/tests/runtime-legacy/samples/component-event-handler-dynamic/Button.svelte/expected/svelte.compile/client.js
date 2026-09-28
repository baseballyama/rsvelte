import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button><!></button>`);

export default function Button($$anchor, $$props) {
	var button = root();
	var node = $.child(button);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(button);

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, button);
}