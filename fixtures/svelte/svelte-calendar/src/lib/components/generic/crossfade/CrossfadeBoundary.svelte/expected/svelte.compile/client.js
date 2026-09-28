import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';

export default function CrossfadeBoundary($$anchor, $$props) {
	$.push($$props, true);
	setContext('crossfade', null);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
	$.pop();
}