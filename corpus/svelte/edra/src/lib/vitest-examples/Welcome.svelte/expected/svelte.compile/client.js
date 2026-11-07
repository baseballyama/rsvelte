import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { greet } from './greet.js';

var root = $.from_html(`<h1> </h1> <p> </p>`, 1);

export default function Welcome($$anchor, $$props) {
	$.push($$props, true);

	let host = $.prop($$props, 'host', 3, 'SvelteKit'),
		guest = $.prop($$props, 'guest', 3, 'Vitest');

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[() => greet(host()), () => greet(guest())]
	);

	$.append($$anchor, fragment);
	$.pop();
}