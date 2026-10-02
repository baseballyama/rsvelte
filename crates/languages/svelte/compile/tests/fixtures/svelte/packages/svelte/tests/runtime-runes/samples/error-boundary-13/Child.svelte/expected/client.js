import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	const d = $.derived(() => {
		if ($$props.count === 1) {
			throw new Error('kaboom');
		}

		return $$props.count;
	});

	$.user_effect(() => {
		$.get(d);
	});

	$.pop();
}