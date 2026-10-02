import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _0_$effect_root_input($$anchor, $$props) {
	$.push($$props, true);

	let count = 0;

	const cleanup = $.effect_root(() => {
		$.user_effect(() => {
			console.log(count);
		});

		return () => {
			console.log('effect root cleanup');
		};
	});

	$.pop();
}