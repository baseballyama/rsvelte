import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { onMount } from 'svelte';

var root = $.from_html(`<h1 id="window-hash"> </h1> <h1 id="page-url-hash"> </h1> <a href="#target">Nav to hash</a> <a href="/routing/hashes/pagestate">Nav to page</a> <div id="target">Target</div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {string} */
	let hash;

	onMount(set_hash);

	function set_hash() {
		hash = window.location.hash;
	}

	var fragment = root();

	$.event('hashchange', $.window, set_hash);

	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var h1_1 = $.sibling(h1, 2);
	var text_1 = $.only_child(h1_1, true);

	$.next(6);

	$.template_effect(() => {
		$.set_text(text, hash);
		$.set_text(text_1, page.url.hash);
	});

	$.append($$anchor, fragment);
	$.pop();
}