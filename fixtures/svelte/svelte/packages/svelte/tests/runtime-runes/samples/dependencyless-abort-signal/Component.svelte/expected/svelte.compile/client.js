import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAbortSignal } from 'svelte';

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	$.user_effect(() => {
		const signal = getAbortSignal();

		signal.addEventListener('abort', () => console.log('abort'));
	});

	$.pop();
}