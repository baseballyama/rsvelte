import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(0);

	$.user_pre_effect(() => {
		console.log("Outer");
		$.get(value);

		$.user_pre_effect(() => {
			console.log("Inner");
			$.set(value, 10);
		});
	});

	$.pop();
}