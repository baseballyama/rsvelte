import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Nested($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'thing', { thing: 2 }, null);
	$.append($$anchor, fragment);
}