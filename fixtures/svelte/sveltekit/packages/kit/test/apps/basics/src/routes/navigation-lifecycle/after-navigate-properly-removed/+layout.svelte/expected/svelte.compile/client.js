import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onNavigate } from '$app/navigation';

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	onNavigate(() => {
		return () => {};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
	$.pop();
}