import * as $ from 'svelte/internal/server';
import { run as run_1 } from 'svelte/legacy';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let count = 0;
		let run = true;

		run_1(() => {
			console.log(count);
		});

		run_1(() => {
			if (count > 10 && run) {
				alert('too high');
			}
		});

		run_1(() => {
			console.log('foo');

			if (x) return;

			console.log('bar');
		});

		run_1(() => {
			$.store_set(count, 1);
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}