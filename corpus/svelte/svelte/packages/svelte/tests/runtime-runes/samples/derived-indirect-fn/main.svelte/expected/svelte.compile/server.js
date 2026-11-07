import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	function doubled() {
		return count * 2;
	}

	let double = $.derived(doubled);

	$$renderer.push(`<button>${$.escape(double())}</button>`);
}