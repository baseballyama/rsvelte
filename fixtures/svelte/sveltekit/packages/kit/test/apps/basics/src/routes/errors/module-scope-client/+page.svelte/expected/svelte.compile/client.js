import 'svelte/internal/disclose-version';
import { browser } from '$app/env';
import * as $ from 'svelte/internal/client';

if (browser) {
	throw new Error('Crashing now');
}

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	$.pop();
}