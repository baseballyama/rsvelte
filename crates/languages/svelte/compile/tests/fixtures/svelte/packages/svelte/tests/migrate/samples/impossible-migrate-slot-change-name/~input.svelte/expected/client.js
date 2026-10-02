import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	let body;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'body', {}, null);
	$.append($$anchor, fragment);
}