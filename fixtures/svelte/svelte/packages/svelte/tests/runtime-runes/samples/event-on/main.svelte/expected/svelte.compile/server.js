import * as $ from 'svelte/internal/server';
import { on } from 'svelte/events';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		function increment(e) {
			e.stopPropagation();
			count += 1;
		}

		let sectionEl;

		$$renderer.push(`<section><button>clicks: ${$.escape(count)}</button></section>`);
	});
}