import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Output($$anchor) {
	let derived;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => derived, ($$anchor, $$component) => {
		$$component($$anchor, {});
	});

	$.append($$anchor, fragment);
}