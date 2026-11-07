import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { greet } from '../utils/helper';

var root = $.from_html(`<p> </p>`);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	let name = $.prop($$props, 'name', 3, 'World');
	const greeting = $.derived(() => greet(name()));
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(greeting)));
	$.append($$anchor, p);
	$.pop();
}