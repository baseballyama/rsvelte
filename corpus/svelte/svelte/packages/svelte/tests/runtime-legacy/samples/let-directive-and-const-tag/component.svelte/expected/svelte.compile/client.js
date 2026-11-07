import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Component($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', { data: 'foo' }, null);
	$.append($$anchor, fragment);
}