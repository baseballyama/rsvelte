import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button><!></button> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.child(button);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(button);

	var node_1 = $.sibling(button, 2);

	$.await(node_1, () => Promise.resolve(0), null, ($$anchor, n) => {
		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(n)));
		$.append($$anchor, text);
	});

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, fragment);
}