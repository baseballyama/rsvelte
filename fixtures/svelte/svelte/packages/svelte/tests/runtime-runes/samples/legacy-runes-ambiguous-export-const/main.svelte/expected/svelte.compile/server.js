import * as $ from 'svelte/internal/server';
import { get, set } from "./test.svelte.js";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const x = 42;

		$$renderer.push(`<p>${$.escape(get())}</p> <button></button>`);
		$.bind_props($$props, { x });
	});
}