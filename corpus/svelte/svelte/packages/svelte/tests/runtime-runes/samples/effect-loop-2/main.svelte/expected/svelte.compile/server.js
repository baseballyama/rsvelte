import * as $ from 'svelte/internal/server';
import { untrack } from "svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let reset = false;

		$$renderer.push(`<!---->${$.escape(count)} <br/> <button>increment</button> <br/> <button>reset</button>`);
	});
}