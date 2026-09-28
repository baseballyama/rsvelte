import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let a = $.state(0);

	let b = $.derived(() => {
		$.user_effect(() => {
			$.set(a, 1);
		});

		return $.get(a);
	});

	;;
	$.pop();
}