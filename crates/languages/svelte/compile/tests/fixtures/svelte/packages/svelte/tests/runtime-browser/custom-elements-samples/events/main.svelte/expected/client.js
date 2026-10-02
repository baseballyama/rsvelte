import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from "svelte";

var root = $.from_html(`<button>bubble click</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();
	var button = root();

	$.event('click', button, () => dispatch("custom", "foo"));
	$.append($$anchor, button);
	$.pop();
}

customElements.define('custom-element', $.create_custom_element(Main, {}, [], [], { mode: 'open' }));