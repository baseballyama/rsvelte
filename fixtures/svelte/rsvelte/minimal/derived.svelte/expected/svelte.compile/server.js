import * as $ from 'svelte/internal/server';

export default function Derived($$renderer) {
	let count = 1;
	let double = $.derived(() => count * 2);

	function increment() {
		count += 1;
	}

	$$renderer.push(`<button>${$.escape(count)} * 2 = ${$.escape(double())}</button>`);
}