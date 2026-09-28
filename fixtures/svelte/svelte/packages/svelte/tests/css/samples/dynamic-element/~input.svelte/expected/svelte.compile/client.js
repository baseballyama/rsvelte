import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => "div", false, ($$element, $$anchor) => {
		$.set_class($$element, 0, 'used svelte-1qv3afp');
	});

	$.append($$anchor, fragment);
}