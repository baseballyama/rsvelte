import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.foo);
	$.append($$anchor, fragment);
}