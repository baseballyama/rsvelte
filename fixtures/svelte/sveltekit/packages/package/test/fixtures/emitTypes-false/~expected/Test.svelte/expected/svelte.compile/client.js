import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

export default function Test($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @type {string}
	 */
	const astring = 'potato';

	const dispatch = createEventDispatcher();

	dispatch('event', true);

	var $$exports = { astring };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', { astring }, null);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}