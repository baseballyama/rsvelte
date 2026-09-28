import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { run as run_1 } from 'svelte/legacy';

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	const $count = () => $.store_get(count, '$count', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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

	$.pop();
	$$cleanup();
}