import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dev } from '$app/env';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	if (dev) {
		// can't throw in prod, the app won't start at all
		throw new Error('Crashing now');
	}

	$.pop();
}