import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from './A.svelte';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => A, ($$anchor, $$component) => {
		$$component($$anchor, {});
	});

	$.append($$anchor, fragment);
}