import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let s = 0;
		let d = $.derived(() => s);

		$$renderer.push(`<h1>${$.escape(s)}</h1> <button>Click</button>`);
	});
}