import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Parent($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'item', { item: 1 }, null);
	$.append($$anchor, fragment);
}