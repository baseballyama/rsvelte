import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button>select foo</button> <button>select bar</button> <button>select baz</button>`, 1);

export default function Widget($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.event('click', button, () => dispatch("select", { selection: "foo" }));
	$.event('click', button_1, () => dispatch("select", { selection: "bar" }));
	$.event('click', button_2, () => dispatch("select", { selection: "baz" }));
	$.append($$anchor, fragment);
	$.pop();
}