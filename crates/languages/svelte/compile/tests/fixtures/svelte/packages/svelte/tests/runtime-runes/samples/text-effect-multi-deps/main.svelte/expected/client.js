import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <button>+</button>`, 1);

export default function Main($$anchor) {
	let x = $.state($.proxy({ a: 0, b: 0 }));
	let count = 0;
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var button = $.sibling(p, 2);

	$.template_effect(() => $.set_text(text, `${$.get(x).a ?? ''} - ${$.get(x).b ?? ''}`));

	$.delegated('click', button, () => {
		const a = ++count;

		$.set(x, { a, b: a }, true);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);