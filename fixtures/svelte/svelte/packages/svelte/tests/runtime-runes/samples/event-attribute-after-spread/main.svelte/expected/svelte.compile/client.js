import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <input/>`, 1);

export default function Main($$anchor) {
	const props = {};
	let changed = $.state(false);

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var input = $.sibling(text);
	var event_handler = () => $.set(changed, true);

	$.attribute_effect(input, () => ({ ...props, oninput: event_handler, class: 'hello' }), void 0, void 0, void 0, void 0, true);
	$.template_effect(() => $.set_text(text, `${$.get(changed) ?? ''} `));
	$.append($$anchor, fragment);
}