import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1> <button>Click</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let s = $.state(0);
	let d = $.derived(() => $.get(s));

	$.user_effect(() => {
		$.get(s);
		console.log('A');
	});

	$.user_effect(() => {
		$.get(d);
		console.log('B');
	});

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var button = $.sibling(h1, 2);

	$.template_effect(() => $.set_text(text, $.get(s)));
	$.event('click', button, () => $.update(s));
	$.append($$anchor, fragment);
	$.pop();
}