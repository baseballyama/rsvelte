import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button></button>`);

export default function Inner($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();
	const exists = true;
	var $$exports = { exists };
	var button = root();

	$.event('click', button, () => dispatch('bar'));
	$.append($$anchor, button);

	return $.pop($$exports);
}