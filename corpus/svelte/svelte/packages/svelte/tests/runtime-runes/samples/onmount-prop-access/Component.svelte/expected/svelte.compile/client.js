import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	let thing = $.state(0);

	onMount(() => {
		$.set(thing, 1);

		return () => {
			console.log($.get(thing));
		};
	});

	$.pop();
}