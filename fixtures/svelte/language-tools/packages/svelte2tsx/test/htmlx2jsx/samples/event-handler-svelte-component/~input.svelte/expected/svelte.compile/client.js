import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Whatever, ($$anchor, $$component) => {
		$$component($$anchor, { $$events: { submit: handleSubmit } });
	});

	$.append($$anchor, fragment);
}