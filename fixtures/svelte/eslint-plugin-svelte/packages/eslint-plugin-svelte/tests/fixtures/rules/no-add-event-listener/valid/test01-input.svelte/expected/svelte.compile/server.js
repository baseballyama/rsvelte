import * as $ from 'svelte/internal/server';
import { on } from 'svelte/events';

export default function Test01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const handler = (ev) => {
			console.log(ev);
		};

		function onClick(event) {
			const target = event.currentTarget;

			on(target, 'focus', handler);
		}

		on(window, 'message', handler);
		on(document, 'visibilitychange', handler);
		$$renderer.push(`<button>Hello</button>`);
	});
}