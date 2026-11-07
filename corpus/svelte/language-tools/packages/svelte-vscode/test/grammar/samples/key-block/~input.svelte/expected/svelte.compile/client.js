import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => hi, ($$anchor) => {});
	$.append($$anchor, fragment);
}