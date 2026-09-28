import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Inner($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'main', {}, null);
	$.append($$anchor, fragment);
}