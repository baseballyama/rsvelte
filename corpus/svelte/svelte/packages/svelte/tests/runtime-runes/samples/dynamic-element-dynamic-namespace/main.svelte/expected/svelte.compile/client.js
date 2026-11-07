import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>change</button> <svg><!></svg>`, 1);

export default function Main($$anchor) {
	let tag = $.state('path');
	let xmlns = $.state('http://www.w3.org/2000/svg');
	var fragment = root();
	var button = $.first_child(fragment);
	var svg = $.sibling(button, 2);
	var node = $.child(svg);

	$.element(
		node,
		() => $.get(tag),
		true,
		($$element, $$anchor) => {
			$.attribute_effect($$element, () => ({ xmlns: $.get(xmlns) }));
		},
		() => $.get(xmlns)
	);

	$.reset(svg);

	$.delegated('click', button, () => {
		$.set(tag, 'div');
		$.set(xmlns, null);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);