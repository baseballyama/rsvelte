import * as $ from 'svelte/internal/server';
import { run } from 'svelte/legacy';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		// triple
		//  update triple
		let triple = $.derived(() => count * 3);

		//  trailing comment
		//  in triple;
		function increment() {
			count += 1;
		}

		// this comment should remain attached to this declaration after migration
		let double = $.derived(() => count * 2); // this too

		run(() => {
			console.log({ count, double: double() });
		});

		$$renderer.push(`<button>clicks: ${$.escape(count)}</button>`);
	});
}