import * as $ from 'svelte/internal/server';
import { fork } from "svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let state = 0;
		let count = $.derived(() => state);

		$$renderer.push(`<button>fork</button>`);
	});
}