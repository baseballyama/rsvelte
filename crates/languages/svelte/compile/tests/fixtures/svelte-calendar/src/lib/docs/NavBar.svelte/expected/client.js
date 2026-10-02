import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getStores } from '$app/stores';
import Crossfade from '$lib/components/generic/crossfade/Crossfade.svelte';
import { setContext } from 'svelte';
import { elasticOut } from 'svelte/easing';

var root = $.from_html(`<nav class="svelte-i0n8wt"><section class="flex svelte-i0n8wt"><!></section> <section class="svelte-i0n8wt"></section></nav>`);

export default function NavBar($$anchor, $$props) {
	$.push($$props, true);

	const { page } = getStores();

	setContext('navbar', page);

	Crossfade($$anchor, {
		get easing() {
			return elasticOut;
		},
		duration: 1250,
		children: ($$anchor, $$slotProps) => {
			var nav = root();
			var section = $.child(nav);
			var node = $.child(section);

			$.slot(node, $$props, 'default', {}, null);
			$.reset(section);
			$.next(2);
			$.reset(nav);
			$.append($$anchor, nav);
		},
		$$slots: { default: true }
	});

	$.pop();
}