import * as $ from 'svelte/internal/server';
import { SvelteDate } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const date = new SvelteDate(0);
		const snapshot = $.derived(() => $.snapshot(date));

		$$renderer.push(`<button>update</button> <p>${$.escape(snapshot().toISOString())}</p>`);
	});
}