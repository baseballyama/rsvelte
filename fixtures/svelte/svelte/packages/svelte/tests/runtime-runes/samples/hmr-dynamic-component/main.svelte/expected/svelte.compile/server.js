import * as $ from 'svelte/internal/server';
import Component from "./Component.svelte";

export default function Main($$renderer) {
	let C = null;

	$$renderer.push(`<button>show</button> `);

	if (C) {
		$$renderer.push('<!--[-->');
		C($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}