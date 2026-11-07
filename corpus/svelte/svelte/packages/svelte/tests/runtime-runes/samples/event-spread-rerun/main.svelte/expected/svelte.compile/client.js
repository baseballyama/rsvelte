import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> `, 1);

export default function Main($$anchor) {
	let rest = $.state(undefined);
	var fragment = root();
	var input = $.first_child(fragment);
	var event_handler = () => console.log('hi');

	$.attribute_effect(input, () => ({ ...$.get(rest), oninput: event_handler }), void 0, void 0, void 0, void 0, true);

	var text = $.sibling(input);

	$.template_effect(() => $.set_text(text, ` ${(!$.get(rest) ? $.set(rest, {}, true) : false) ?? ''}`));
	$.append($$anchor, fragment);
}