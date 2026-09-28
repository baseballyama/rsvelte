import * as $ from 'svelte/internal/server';
import { Select as SelectPrimitive } from 'bits-ui';
import { useSplitButtonRootCtx } from './split-button.svelte.js';

export default function Split_button_select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, children, $$slots, $$events, ...restProps } = $$props;
		const root = useSplitButtonRootCtx();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (SelectPrimitive.Root) {
				$$renderer.push('<!--[-->');

				SelectPrimitive.Root($$renderer, $.spread_props([
					{ type: 'single', onValueChange: (v) => root.onSelect(v) },
					restProps,
					{
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						get value() {
							return root.action;
						},

						set value($$value) {
							root.action = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							children?.($$renderer);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { open });
	});
}