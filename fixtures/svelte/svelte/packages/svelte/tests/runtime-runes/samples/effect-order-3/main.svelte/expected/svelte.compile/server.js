import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		function increment() {
			count += 1;
			console.log("in-increment", count);
		}

		;;
		$$renderer.push(`<button>clicks: ${$.escape(count)}</button>`);
	});
}