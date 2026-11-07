import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'dashed-name', {}, null);
	$.append($$anchor, fragment);
}