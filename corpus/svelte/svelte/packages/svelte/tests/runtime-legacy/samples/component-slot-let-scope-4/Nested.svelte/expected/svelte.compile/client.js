import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Nested($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'inner', { text: 'hello world' }, null);
	$.append($$anchor, fragment);
}