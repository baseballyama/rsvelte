import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Nested from './Nested.svelte';

export default function Components04_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Nested.default, ($$anchor, Nested_default) => {
		Nested_default($$anchor, {});
	});

	$.append($$anchor, fragment);
}