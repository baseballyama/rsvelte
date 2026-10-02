import * as $ from 'svelte/internal/server';
import { useOptions } from '../options.svelte.js';
import HtmlViewFull from './HTMLViewFull.svelte';
import HtmlViewSimple from './HTMLViewSimple.svelte';

export default function HTMLView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;
		const options = useOptions();

		if (options.value.elementView === 'simple') {
			$$renderer.push('<!--[0-->');
			HtmlViewSimple($$renderer, $.spread_props([props]));
		} else {
			$$renderer.push('<!--[-1-->');
			HtmlViewFull($$renderer, $.spread_props([props]));
		}

		$$renderer.push(`<!--]-->`);
	});
}