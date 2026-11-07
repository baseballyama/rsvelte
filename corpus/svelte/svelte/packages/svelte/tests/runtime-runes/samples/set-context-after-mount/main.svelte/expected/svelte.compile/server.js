import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let condition = false;

		$$renderer.push(`<button>${$.escape(condition)}</button>`);
	});
}