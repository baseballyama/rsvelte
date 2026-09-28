import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from "svelte";

var root = $.from_html(`<button>toggle</button>`);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();
	var button = root();

	$.event('click', button, () => dispatch('event-name'));
	$.append($$anchor, button);
	$.pop();
}