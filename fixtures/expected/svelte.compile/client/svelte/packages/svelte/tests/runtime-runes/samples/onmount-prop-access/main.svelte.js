import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import Component from './Component.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let key = $.state(0);

	onMount(() => {
		$.set(key, 1);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => $.get(key), ($$anchor) => {
		Component($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
}