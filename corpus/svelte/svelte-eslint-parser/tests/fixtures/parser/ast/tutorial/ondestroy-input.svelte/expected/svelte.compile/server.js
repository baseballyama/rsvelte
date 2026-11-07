import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';

export default function Ondestroy_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let seconds = 0;
		const interval = setInterval(() => seconds += 1, 1000);

		onDestroy(() => clearInterval(interval));

		$$renderer.push(`<p>The page has been open for
	${$.escape(seconds)} ${$.escape(seconds === 1 ? 'second' : 'seconds')}</p>`);
	});
}