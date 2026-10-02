import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		let el;

		$$renderer.push(`<div><button>clicks: ${$.escape(count)}</button> <button>clicks: ${$.escape(count)}</button></div>`);
	});
}