import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mount, onMount } from 'svelte';
import Outer from './Outer.svelte';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let el;

	onMount(() => {
		try {
			mount(Outer, { target: el });
		} catch {}
	});

	var div = root();

	$.bind_this(div, ($$value) => el = $$value, () => el);
	$.append($$anchor, div);
	$.pop();
}