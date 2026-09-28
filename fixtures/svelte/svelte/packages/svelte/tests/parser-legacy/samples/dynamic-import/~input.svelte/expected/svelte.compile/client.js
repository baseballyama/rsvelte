import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		import('./foo.js').then((foo) => {
			console.log(foo.default);
		});
	});

	$.pop();
}