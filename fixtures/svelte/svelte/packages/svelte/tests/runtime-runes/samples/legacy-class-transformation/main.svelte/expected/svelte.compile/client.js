import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import Inner from './inner.svelte';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let target;

	onMount(() => {
		new Inner({ target, props: { num: 1 } });
	});

	var div = root();

	$.bind_this(div, ($$value) => target = $$value, () => target);
	$.append($$anchor, div);
	$.pop();
}