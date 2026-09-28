import * as $ from 'svelte/internal/server';
import Component from "./Component.svelte";

export default function Main($$renderer) {
	let toggle = true;

	$$renderer.push(`<button>toggle</button> `);

	if (toggle) {
		$$renderer.push('<!--[0-->');
		Component($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}