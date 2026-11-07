import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	const der = $.derived(() => false);

	$.user_effect(() => {
		$.get(der);
	});

	$.pop();
}