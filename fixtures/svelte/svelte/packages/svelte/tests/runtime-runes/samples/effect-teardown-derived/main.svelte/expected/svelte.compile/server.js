import * as $ from 'svelte/internal/server';
import Component from "./Component.svelte";

export default function Main($$renderer) {
	let message = 'hello';
	let count = 0;

	$$renderer.push(`<button>${$.escape(count)}</button> <button>${$.escape(message)}</button> `);

	if (count < 2 && message === 'hello') {
		$$renderer.push('<!--[0-->');
		Component($$renderer, { count, message });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}