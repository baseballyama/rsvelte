import * as $ from 'svelte/internal/server';
import { useOptions } from '../options.svelte.js';
import HtmlView from './HTMLView.svelte';

export default function HTMLImageElementView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, $$slots, $$events, ...rest } = $$props;
		let options = useOptions();

		HtmlView($$renderer, $.spread_props([
			{ value },
			rest,
			{
				children: ($$renderer) => {
					if (value.src && options.value.embedMedia) {
						$$renderer.push(`<!--[0--><div class="image svelte-1h2yw57"><img${$.attr('alt', value.alt)}${$.attr('src', value.src)} class="svelte-1h2yw57"/></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			}
		]));
	});
}