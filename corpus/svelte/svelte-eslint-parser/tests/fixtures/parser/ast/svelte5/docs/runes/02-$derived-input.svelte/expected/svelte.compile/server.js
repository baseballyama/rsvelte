import * as $ from 'svelte/internal/server';

export default function _2_$derived_input($$renderer) {
	let count = 0;
	let double = $.derived(() => count * 2);

	$$renderer.push(`<button>${$.escape(double())}</button> <p>${$.escape(count)} doubled is ${$.escape(double())}</p>`);
}