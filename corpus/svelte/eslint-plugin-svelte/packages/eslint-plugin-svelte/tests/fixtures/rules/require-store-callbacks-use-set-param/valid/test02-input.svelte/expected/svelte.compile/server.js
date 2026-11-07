import * as $ from 'svelte/internal/server';
import { readable, writable, derived } from 'svelte/store';

export default function Test02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		readable(null, function (set) {
			set(new Date());

			const interval = setInterval(() => set(new Date()), 1000);

			return () => clearInterval(interval);
		});

		readable(false, function (set) {
			/* do nothing */
		});

		writable(0, function (set) {
			return () => {};
		});

		writable(null, function (set) {
			set(0);

			return () => {};
		});

		derived(a, function ($a) {
			/* do nothing */
		});

		derived(
			a,
			function ($a, set) {
				setTimeout(() => set($a), 1000);
			},
			'one moment...'
		);
	});
}