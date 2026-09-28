import * as $ from 'svelte/internal/server';

export default function Derived($$renderer) {
	let count = 0;
	let factor = 2;
	let result = $.derived(() => count * factor);

	$$renderer.push(`<div class="container"><div><p class="svelte-anvqu">${$.escape(count)} * ${$.escape(factor)} = ${$.escape(result())}</p> <button>Count: ${$.escape(count)}</button> <button>Factor: ${$.escape(factor)}</button></div></div>`);
}