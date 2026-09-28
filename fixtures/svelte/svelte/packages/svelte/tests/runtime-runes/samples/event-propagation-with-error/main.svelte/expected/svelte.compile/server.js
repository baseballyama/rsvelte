import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let y = 0;
		let n = 0;

		function yep() {
			y += 1;
		}

		function nope() {
			n += 1;

			throw new Error('nope');
		}

		$$renderer.push(`<div><button>${$.escape(y)} ${$.escape(n)}</button></div>`);
	});
}