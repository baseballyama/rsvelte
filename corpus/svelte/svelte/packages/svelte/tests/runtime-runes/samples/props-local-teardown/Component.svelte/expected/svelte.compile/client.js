import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	let x = $.prop($$props, 'x', 7);

	$.user_effect(() => {
		console.log('init');

		x(() => {
			console.log('teardown');
		});

		return () => {
			x()();
		};
	});

	$.pop();
}