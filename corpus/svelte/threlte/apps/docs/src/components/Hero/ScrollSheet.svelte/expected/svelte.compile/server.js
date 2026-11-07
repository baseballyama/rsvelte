import * as $ from 'svelte/internal/server';
import { Sheet } from '@threlte/theatre';
import { mapLinear } from 'three/src/math/MathUtils.js';
import { scrollPos, springScrollPos } from './scrollPos';

export default function ScrollSheet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			useSpring = true,
			name,
			startAtScrollPosition = 0,
			endAtScrollPosition = 1,
			children
		} = $$props;

		let sheet = void 0;

		let sheetProgress = $.derived(() => Math.max(
			mapLinear(
				useSpring
					? $.store_get($$store_subs ??= {}, '$springScrollPos', springScrollPos)
					: $.store_get($$store_subs ??= {}, '$scrollPos', scrollPos),
				startAtScrollPosition,
				endAtScrollPosition,
				0,
				10
			),
			0
		));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Sheet($$renderer, {
				name,
				get sheet() {
					return sheet;
				},

				set sheet($$value) {
					sheet = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}