import * as $ from 'svelte/internal/server';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let map = new SvelteMap();
		let set = new SvelteSet();

		;;
		;;
		$$renderer.push(`<button>Map</button> <button>Set</button>`);
	});
}