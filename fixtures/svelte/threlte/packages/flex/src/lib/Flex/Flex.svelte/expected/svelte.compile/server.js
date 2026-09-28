import * as $ from 'svelte/internal/server';
import { loadYoga } from 'yoga-layout/load';
import InnerFlex from './InnerFlex.svelte';

export default function Flex($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children: innerChildren,
			ref = void 0,
			$$slots,
			$$events,
			...props
		} = $$props;

		let yoga = void 0;

		const initialize = async () => {
			yoga = await loadYoga();
		};

		initialize();

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (yoga) {
				$$renderer.push('<!--[0-->');

				{
					function children($$renderer, { reflow, width, height }) {
						innerChildren?.($$renderer, { reflow, width, height });
						$$renderer.push(`<!---->`);
					}

					InnerFlex($$renderer, $.spread_props([
						{ yoga },
						props,
						{
							get ref() {
								return ref;
							},

							set ref($$value) {
								ref = $$value;
								$$settled = false;
							},
							children,
							$$slots: { default: true }
						}
					]));
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}