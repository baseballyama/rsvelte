import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';
import { beforeUpdate } from 'svelte';

export default function Child($$anchor, $$props) {
	$.push($$props, false);

	let object = $.prop($$props, 'object', 8);

	beforeUpdate(() => {
		console.log('changed');
	});

	$.init();
	$.pop();
}