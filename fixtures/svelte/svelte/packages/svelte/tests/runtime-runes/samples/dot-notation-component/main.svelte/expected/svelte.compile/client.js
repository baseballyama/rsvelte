import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import child from './child.svelte';

export default function Main($$anchor) {
	const components = { child };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => components.child, ($$anchor, components_child) => {
		components_child($$anchor, {});
	});

	$.append($$anchor, fragment);
}