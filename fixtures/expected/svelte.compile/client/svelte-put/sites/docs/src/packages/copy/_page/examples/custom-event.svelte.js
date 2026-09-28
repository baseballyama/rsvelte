import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { copy } from '@svelte-put/copy';

var root = $.from_html(`<button type="button">...</button> <button type="button">...</button>`, 1);

export default function Custom_event($$anchor) {
	var fragment = root();
	var button = $.first_child(fragment);

	$.action(button, ($$node, $$action_arg) => copy?.($$node, $$action_arg), () => ({ event: 'mousedown' }));

	var button_1 = $.sibling(button, 2);

	$.action(button_1, ($$node, $$action_arg) => copy?.($$node, $$action_arg), () => ({ event: ['pointerenter', 'pointerleave'] }));
	$.append($$anchor, fragment);
}