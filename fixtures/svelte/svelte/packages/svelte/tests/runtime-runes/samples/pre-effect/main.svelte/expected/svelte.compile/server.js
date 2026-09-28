import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let x = 0;
		let y = 0;

		$$renderer.push(`<button>${$.escape(x)}</button> <button>${$.escape(y)}</button>`);
	});
}