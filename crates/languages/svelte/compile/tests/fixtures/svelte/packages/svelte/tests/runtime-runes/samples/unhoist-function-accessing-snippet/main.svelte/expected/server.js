import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const log = () => {
			if (!snip) throw new Error('oops');
		};

		let x = 0;

		function snip($$renderer) {
			$$renderer.push(`<!---->snippet 0`);
		}

		$$renderer.push(`<button></button>`);
	});
}