import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { disableScrollHandling } from '$app/navigation';

var root = $.from_html(`<div style="height: 180vh; background-color: hotpink;">They (don't) see me...</div> <div style="height: 180vh; background-color: peru;"><p id="go-to-element">The browser scrolls to me</p></div> <p id="abcde" style="height: 180vh; background-color: hotpink;">I take precedence</p> <div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		disableScrollHandling();
		document.getElementById('abcde')?.scrollIntoView();
	});

	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
	$.pop();
}