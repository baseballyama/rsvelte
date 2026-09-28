import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = null;

		$$renderer.push(`<button>items: ${$.escape(JSON.stringify(items))}</button>`);
	});
}