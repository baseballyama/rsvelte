import * as $ from 'svelte/internal/server';
import { run } from 'svelte/legacy';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let count = 0;

		run(() => {
			console.log(count);
		});

		run(() => {
			if (count > 10) {
				alert('too high');
			}
		});

		run(() => {
			console.log('foo');

			if (x) return;

			console.log('bar');
		});

		run(() => {
			$.store_set(count, 1);
		});

		run(() => {
			foo.x = count;
		});

		$$renderer.push(`<button>increment</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}