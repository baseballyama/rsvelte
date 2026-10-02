import * as $ from 'svelte/internal/server';
import Child from "./Child.svelte";
import { store } from "./store.svelte.js";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const visible = $.derived(() => store.get("visible"));
		const visible2 = $.derived(visible);

		$$renderer.push(`<button>show</button> <button>hide</button> `);

		if (visible2()) {
			$$renderer.push('<!--[0-->');
			Child($$renderer, {});
			$$renderer.push(`<!----> <div>visible</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}