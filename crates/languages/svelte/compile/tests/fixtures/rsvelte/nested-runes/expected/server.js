import * as $ from 'svelte/internal/server';

export default function Nested_runes($$renderer) {
	let result = void 0;
	function measure() {
		let items = [1, 2];
		let total = $.derived(() => items.length);
		items.push(3);
		result = total();
	}
	$$renderer.push(`<button>${$.escape(result)}</button>`);
}
