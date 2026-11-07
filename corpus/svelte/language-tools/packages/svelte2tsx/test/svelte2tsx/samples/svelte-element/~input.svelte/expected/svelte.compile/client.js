import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	let tag = 'div';
	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, () => tag, false);

	var node_1 = $.sibling(node, 2);

	$.element(node_1, () => 'tag', false);

	var node_2 = $.sibling(node_1, 2);

	$.element(node_2, () => tag ? 'a' : 'b', false);

	var node_3 = $.sibling(node_2, 2);

	$.element(node_3, () => tag, false, ($$element_3, $$anchor) => {
		var text = $.text();

		text.nodeValue = 'div';
		$.append($$anchor, text);
	});

	var node_4 = $.sibling(node_3, 2);

	$.element(node_4, () => tag, false, ($$element_4, $$anchor) => {
		$.event('click', $$element_4, () => tag);
	});

	var node_5 = $.sibling(node_4, 2);

	$.element(node_5, () => 'a', false, ($$element_5, $$anchor) => {
		$.attribute_effect($$element_5, () => ({
			'data-sveltekit-preload-data': true,
			href: 'https://kit.svelte.dev'
		}));
	});

	$.append($$anchor, fragment);
}