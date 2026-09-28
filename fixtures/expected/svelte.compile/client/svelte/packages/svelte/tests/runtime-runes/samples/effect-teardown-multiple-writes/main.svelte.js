import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>go</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state('one');
	const registry = new Set();

	$.user_effect(() => {
		registry.add($.get(value));
		console.log(`register: ${$.get(value)}`);

		return () => {
			registry.delete($.get(value));
			console.log(`unregister: ${$.get(value)}`);
			console.log(`leftover: ${[...registry].join(', ') || 'none'}`);
		};
	});

	var button = root();

	$.delegated('click', button, () => {
		$.set(value, 'two');
		$.set(value, 'three');
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);