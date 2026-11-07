import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li><a target="_blank"> </a></li>`);
var root_1 = $.from_html(`<h1>The Famous Cats of YouTube</h1> <ul></ul>`, 1);

export default function Each_blocks02_input($$anchor) {
	let cats = [
		{ id: 'J---aiyznGQ', name: 'Keyboard Cat' },
		{ id: 'z_AbfPXTKms', name: 'Maru' },
		{ id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
	];

	var fragment = root_1();
	var ul = $.sibling($.first_child(fragment), 2);

	$.each(ul, 21, () => cats, $.index, ($$anchor, cat, i) => {
		var li = root();
		var a = $.child(li);
		var text = $.only_child(a);

		$.reset(li);

		$.template_effect(() => {
			$.set_attribute(a, 'href', `https://www.youtube.com/watch?v=${$.get(cat).id ?? ''}`);
			$.set_text(text, `${i + 1}: ${$.get(cat).name ?? ''}`);
		});

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, fragment);
}