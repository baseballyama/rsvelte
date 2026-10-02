import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	$.user_pre_effect(() => {
		throw new Error('oh noes');
	});

	$.pop();
}