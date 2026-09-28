import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import Ace from './Ace.svelte';

export default function Editor($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	let ace = void 0;

	function editor() {
		return ace;
	}

	$$renderer.push(`<!--[-->`);

	{
		if (browser) {
			$$renderer.push('<!--[0-->');
			Ace($$renderer, $.spread_props([props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { editor });
}