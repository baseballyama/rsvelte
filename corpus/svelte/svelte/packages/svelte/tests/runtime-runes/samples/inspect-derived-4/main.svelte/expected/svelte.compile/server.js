import * as $ from 'svelte/internal/server';
import { SvelteSet } from "svelte/reactivity";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ids = [0, 1, 2];
		const seenIds = new SvelteSet();
		const unseenIds = $.derived(() => ids.filter((id) => !seenIds.has(id)));
		const currentId = $.derived(() => unseenIds().at(0));

		;;
		$$renderer.push(`<button>first unseen: ${$.escape(currentId())}</button>`);
	});
}