import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	let x = $.state(false);

	$.user_effect(() => {
		$.set(x, true);

		return () => {
			$.set(x, false);
		};
	});

	$.pop();
}