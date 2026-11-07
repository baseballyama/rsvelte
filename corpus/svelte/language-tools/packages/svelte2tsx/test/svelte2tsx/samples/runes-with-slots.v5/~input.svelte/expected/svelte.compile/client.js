import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	/** @type {SomeType} */
	let x = 0;

	let y = $.derived(() => x * 2);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', { x, y: $.get(y) }, null);
	$.append($$anchor, fragment);
}