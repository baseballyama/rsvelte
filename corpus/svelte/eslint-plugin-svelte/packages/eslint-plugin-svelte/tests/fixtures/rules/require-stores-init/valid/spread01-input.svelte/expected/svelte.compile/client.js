import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { derived } from 'svelte/store';

export default function Spread01_input($$anchor, $$props) {
	$.push($$props, true);

	const args = [[a, b], () => {}, false];
	const d = derived(...args);

	$.pop();
}