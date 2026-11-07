import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { onMount } from 'svelte';

var root = $.from_html(`<h1> </h1>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let answer = 0;

	onMount(async () => {
		const res = await fetch(`${page.url.origin}/load/window-fetch/data.json`);

		({ answer } = await res.json());
	});

	var h1 = root();
	var text = $.only_child(h1, true);

	$.template_effect(() => $.set_text(text, answer));
	$.append($$anchor, h1);
	$.pop();
}