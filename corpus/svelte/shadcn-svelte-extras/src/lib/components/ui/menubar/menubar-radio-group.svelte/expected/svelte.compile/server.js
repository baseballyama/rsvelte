import * as $ from 'svelte/internal/server';
import { Menubar as MenubarPrimitive } from 'bits-ui';

export default function Menubar_radio_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, value = '', $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (MenubarPrimitive.RadioGroup) {
				$$renderer.push('<!--[-->');

				MenubarPrimitive.RadioGroup($$renderer, $.spread_props([
					{ 'data-slot': 'menubar-radio-group' },
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
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
		$.bind_props($$props, { ref, value });
	});
}