import 'svelte/internal/disclose-version';
import { browser } from '$app/env';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';

if (browser) {
	window.mounted = window.mounted || 0;
}

var root = $.from_html(`<h1> </h1> <button>click me</button> <span hidden="">PLACEHOLDER:0</span>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let mounted = 0;

	onMount(() => {
		mounted = window.mounted += 1;
	});

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);
	var button = $.sibling(h1, 2);

	$.next(2);
	$.template_effect(() => $.set_text(text, `mounted: ${(browser ? mounted : 0) ?? ''}`));
	$.delegated('click', button, () => goto('/double-mount'));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);