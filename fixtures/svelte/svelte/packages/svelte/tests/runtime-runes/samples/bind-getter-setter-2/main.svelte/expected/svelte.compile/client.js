import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let child = $.state(void 0);

	$.user_effect(() => {
		console.log($.get(child).someData);
	});

	$.bind_this(Child($$anchor, {}), (v) => $.set(child, v, true), () => $.get(child));
	$.pop();
}