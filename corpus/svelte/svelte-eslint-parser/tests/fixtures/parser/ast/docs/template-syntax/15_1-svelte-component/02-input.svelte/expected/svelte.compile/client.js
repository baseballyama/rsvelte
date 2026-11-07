import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _2_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => currentSelection.component, ($$anchor, $$component) => {
		$$component($$anchor, { foo: bar });
	});

	$.append($$anchor, fragment);
}