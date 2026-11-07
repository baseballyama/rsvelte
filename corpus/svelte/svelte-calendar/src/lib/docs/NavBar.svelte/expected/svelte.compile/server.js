import * as $ from 'svelte/internal/server';
import { getStores } from '$app/stores';
import Crossfade from '$lib/components/generic/crossfade/Crossfade.svelte';
import { setContext } from 'svelte';
import { elasticOut } from 'svelte/easing';

export default function NavBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { page } = getStores();

		setContext('navbar', page);

		Crossfade($$renderer, {
			easing: elasticOut,
			duration: 1250,
			children: ($$renderer) => {
				$$renderer.push(`<nav class="svelte-i0n8wt"><section class="flex svelte-i0n8wt"><!--[-->`);
				$.slot($$renderer, $$props, 'default', {}, null);
				$$renderer.push(`<!--]--></section> <section class="svelte-i0n8wt"></section></nav>`);
			},
			$$slots: { default: true }
		});
	});
}