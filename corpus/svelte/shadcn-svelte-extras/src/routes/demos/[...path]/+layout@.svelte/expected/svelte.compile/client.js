import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

export default function _layout_($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => page.params.path, ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.snippet(node_1, () => $$props.children);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}