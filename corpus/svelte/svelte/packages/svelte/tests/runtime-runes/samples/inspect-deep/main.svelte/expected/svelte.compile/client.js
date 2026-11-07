import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let items = [{}];
	let data = $.state(void 0);

	$.user_effect(() => {
		$.set(data, items.slice(0, 1), true);
	});

	;;
	$.pop();
}