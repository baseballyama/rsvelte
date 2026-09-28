import * as $ from 'svelte/internal/server';
import Component from "./Component.svelte";

function snip($$renderer) {
	$$renderer.push(`<p>snip</p>`);
}

export default function Main($$renderer) {
	let count = 0;

	$$renderer.push(`<button></button> `);

	if (true) {
		$$renderer.push('<!--[0-->');

		const test = count % 2 === 0 ? undefined : snip;

		Component($$renderer, { test });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}