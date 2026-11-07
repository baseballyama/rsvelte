import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

export default function Main($$anchor) {
	const arr = Array.from({ length: 10001 });
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => arr, $.index, ($$anchor, $$item) => {
		Component($$anchor, {});
	});

	$.append($$anchor, fragment);
}