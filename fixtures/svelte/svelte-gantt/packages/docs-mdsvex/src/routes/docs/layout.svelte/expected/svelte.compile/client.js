import 'svelte/internal/disclose-version';
import a from '$lib/components/A.svelte';
import * as $ from 'svelte/internal/client';

export { a };

export default function Layout($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}