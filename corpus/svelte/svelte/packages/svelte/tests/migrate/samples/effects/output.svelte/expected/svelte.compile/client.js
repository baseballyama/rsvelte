import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { run } from 'svelte/legacy';

var root = $.from_html(`<button>increment</button>`);

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	const $count = () => $.store_get($.get(count), '$count', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let count = $.state(0);

	run(() => {
		console.log($.get(count));
	});

	run(() => {
		if ($.get(count) > 10) {
			alert('too high');
		}
	});

	run(() => {
		console.log('foo');

		if (x) return;

		console.log('bar');
	});

	run(() => {
		$.store_set($.get(count), 1);
	});

	run(() => {
		foo.x = $.get(count);
	});

	var button = root();

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);