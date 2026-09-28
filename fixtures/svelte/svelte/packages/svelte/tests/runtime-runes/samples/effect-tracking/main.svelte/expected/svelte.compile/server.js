import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const foo = false;
		let bar = false;

		$$renderer.push(`<p>${$.escape(foo)}</p> <p>${$.escape(bar)}</p> <p>${$.escape((bar, false))}</p> <p>${$.escape(untrack(() => (bar, false)))}</p>`);
	});
}