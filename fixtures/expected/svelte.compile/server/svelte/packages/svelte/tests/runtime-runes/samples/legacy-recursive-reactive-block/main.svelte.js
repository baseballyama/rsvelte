import * as $ from 'svelte/internal/server';
import { run } from 'svelte/legacy';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		run(() => {
			count = count + 1;
		});

		$$renderer.push(`<!---->${$.escape(count)}`);
	});
}