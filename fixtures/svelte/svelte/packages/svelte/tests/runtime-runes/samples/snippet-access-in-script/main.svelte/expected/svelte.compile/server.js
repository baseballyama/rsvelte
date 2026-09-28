import * as $ from 'svelte/internal/server';
import { fn } from "./fn.js";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let variable = "var";

		fn(test);

		function test($$renderer) {
			$$renderer.push(`<!---->var`);
		}
	});
}