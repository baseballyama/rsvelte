import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _1_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.html(node, () => expression);
	$.append($$anchor, fragment);
}