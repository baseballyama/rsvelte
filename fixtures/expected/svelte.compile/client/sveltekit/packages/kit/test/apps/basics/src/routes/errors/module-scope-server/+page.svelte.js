import 'svelte/internal/disclose-version';
import { dev } from '$app/env';
import * as $ from 'svelte/internal/client';

if (dev) {
	// can't throw in prod, the app won't start at all
	throw new Error('Crashing now');
}

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	$.pop();
}