import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { hydratable } from 'svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	hydratable('key', () => new Promise(() => {
		throw new Error('nope');
	}));

	$.pop();
}