import * as $ from 'svelte/internal/server';
import LinkBase from './Link.base.svelte';
import Path from '../Path/Path.svg.svelte';

export default function Link_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { pathRef = void 0, $$slots, $$events, ...rest } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			LinkBase($$renderer, $.spread_props([
				{ Path },
				rest,
				{
					get pathRef() {
						return pathRef;
					},

					set pathRef($$value) {
						pathRef = $$value;
						$$settled = false;
					}
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { pathRef });
	});
}