import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	onMount(async () => {
		await 123;
	});

	$.pop();
}