import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Entry($$anchor, $$props) {
	$.push($$props, true);

	$.user_effect(() => {
		$$props.entry;
	});

	$.pop();
}