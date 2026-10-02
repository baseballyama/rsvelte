import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Should not appear</button>`);
var root_1 = $.from_html(`<p><!></p>`);

export default function Nested($$anchor, $$props) {
	function click() {}

	var p = root_1();
	var node = $.child(p);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var button = root();

		$.event('click', button, function ($$arg) {
			$.bubble_event.call(this, $$props, $$arg);
		});

		$.append($$anchor, button);
	});

	$.reset(p);
	$.append($$anchor, p);
}