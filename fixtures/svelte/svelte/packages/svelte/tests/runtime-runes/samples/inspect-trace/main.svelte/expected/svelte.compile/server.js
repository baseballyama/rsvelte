import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let double = $.derived(() => count * 2);
		let checked = false;

		$$renderer.push(`<button>${$.escape(double())}</button> <input type="checkbox"${$.attr('checked', checked, true)}/>`);
	});
}