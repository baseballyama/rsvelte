import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let state = { current: count };

		let linked = $.derived(() => {
			count;
			untrack(() => state.current = count);

			return untrack(() => state);
		});

		linked().current++;
		$$renderer.push(`<button>linked.current</button> ${$.escape(linked().current)} <button>count</button> ${$.escape(count)}`);
	});
}