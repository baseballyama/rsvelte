import * as $ from 'svelte/internal/server';
import Child from "./Child.svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show = true;
		let child = void 0;
		let increment;

		$$renderer.push(`<button>hide</button> <button>increment</button> `);

		if (show) {
			$$renderer.push('<!--[0-->');
			Child($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}