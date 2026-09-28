import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Two($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'b', {}, null);
	$.append($$anchor, fragment);
}