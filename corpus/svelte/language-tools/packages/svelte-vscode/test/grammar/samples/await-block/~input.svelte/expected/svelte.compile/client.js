import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.await(node, () => Promise.resolve(''), null, ($$anchor, v) => {
		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(v)));
		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => Promise.resolve(''), ($$anchor) => {}, ($$anchor) => {
		var text_1 = $.text();

		text_1.nodeValue = v;
		$.append($$anchor, text_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.await(node_2, () => Promise.reject(''), ($$anchor) => {}, void 0, ($$anchor, err) => {
		var text_2 = $.text();

		$.template_effect(() => $.set_text(text_2, $.get(err)));
		$.append($$anchor, text_2);
	});

	var node_3 = $.sibling(node_2, 2);

	$.await(node_3, () => Promise.reject(''), null, void 0, ($$anchor, name) => {
		var text_3 = $.text('...');

		$.append($$anchor, text_3);
	});

	$.append($$anchor, fragment);
}