import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';

export default function Nested($$anchor, $$props) {
	$.push($$props, true);
	setContext('a', 1);
	setContext('b', 2);
	setContext('c', 3);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
	$.pop();
}