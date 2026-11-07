import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button>select foo</button>`);

export default function Foo($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();
	var button = root();

	$.event('click', button, () => dispatch("select", { id: "foo" }));
	$.append($$anchor, button);
	$.pop();
}