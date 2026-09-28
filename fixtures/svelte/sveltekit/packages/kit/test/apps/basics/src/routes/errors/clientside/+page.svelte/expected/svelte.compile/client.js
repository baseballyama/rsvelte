import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/env';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	if (browser) {
		throw new Error('Crashing now');
	}

	$.pop();
}