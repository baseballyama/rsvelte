import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

export default function Picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, submenu, $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (submenu) {
				$$renderer.push('<!--[0-->');

				if (DropdownMenuPrimitive.Sub) {
					$$renderer.push('<!--[-->');

					DropdownMenuPrimitive.Sub($$renderer, $.spread_props([
						restProps,
						{
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
								$$settled = false;
							}
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');

				if (DropdownMenuPrimitive.Root) {
					$$renderer.push('<!--[-->');

					DropdownMenuPrimitive.Root($$renderer, $.spread_props([
						restProps,
						{
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
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

			$$renderer.push(`<!--]-->`);
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