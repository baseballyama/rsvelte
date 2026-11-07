import * as $ from 'svelte/internal/server';
import { initRapier } from '../../lib/initRapier.svelte.js';
import InnerWorld from './InnerWorld.svelte';

export default function World($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { fallback, children, $$slots, $$events, ...rest } = $$props;

		$.await($$renderer, initRapier(), () => {}, () => {
			InnerWorld($$renderer, $.spread_props([
				rest,
				{
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		});

		$$renderer.push(`<!--]-->`);
	});
}