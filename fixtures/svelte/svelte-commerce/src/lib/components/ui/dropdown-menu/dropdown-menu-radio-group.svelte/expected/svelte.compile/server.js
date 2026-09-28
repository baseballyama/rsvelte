import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

export default function Dropdown_menu_radio_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = undefined, children, $$slots, $$events, ...rest } = $$props;
		const children_render = $.derived(() => children);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer) {
					children_render()?.($$renderer);
					$$renderer.push(`<!---->`);
				}

				if (DropdownMenuPrimitive.RadioGroup) {
					$$renderer.push('<!--[-->');

					DropdownMenuPrimitive.RadioGroup($$renderer, {
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},
						children,
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}