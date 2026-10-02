import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Effect01_input($$anchor, $$props) {
	$.push($$props, true);

	$.user_effect(() => {
		const a = window.localStorage.getItem('myCat');

		console.log(a);
	});

	$.pop();
}