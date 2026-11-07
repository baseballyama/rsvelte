import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

export default function On_mount01_input($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		const a = window.localStorage.getItem('myCat');

		console.log(a);
	});

	$.pop();
}