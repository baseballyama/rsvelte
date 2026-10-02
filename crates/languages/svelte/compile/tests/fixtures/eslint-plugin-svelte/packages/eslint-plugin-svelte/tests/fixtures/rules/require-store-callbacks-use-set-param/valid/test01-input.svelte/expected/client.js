import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { readable, writable, derived } from 'svelte/store';

export default function Test01_input($$anchor, $$props) {
	$.push($$props, true);

	readable(null, (set) => {
		set(new Date());

		const interval = setInterval(() => set(new Date()), 1000);

		return () => clearInterval(interval);
	});

	readable(false, (set) => true);

	writable(null, (set) => {
		set(0);

		return () => {};
	});

	derived(a, ($a) => $a * 2);

	derived(
		a,
		($a, set) => {
			setTimeout(() => set($a), 1000);
		},
		'one moment...'
	);

	$.pop();
}