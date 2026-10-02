import * as $ from 'svelte/internal/server';
import Component from "./Component.svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let props = { label: 0, size: 0 };
		let filteredProps = void 0;

		$$renderer.push(`<button></button> `);
		Component($$renderer, $.spread_props([filteredProps]));
		$$renderer.push(`<!---->`);
	});
}