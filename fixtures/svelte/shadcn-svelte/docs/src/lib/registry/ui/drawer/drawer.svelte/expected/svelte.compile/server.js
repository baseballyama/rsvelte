import * as $ from 'svelte/internal/server';
import { Drawer as DrawerPrimitive } from "vaul-svelte";

export default function Drawer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			shouldScaleBackground = true,
			open = false,
			activeSnapPoint = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DrawerPrimitive.Root) {
				$$renderer.push('<!--[-->');

				DrawerPrimitive.Root($$renderer, $.spread_props([
					{ shouldScaleBackground },
					restProps,
					{
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						get activeSnapPoint() {
							return activeSnapPoint;
						},

						set activeSnapPoint($$value) {
							activeSnapPoint = $$value;
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
		$.bind_props($$props, { open, activeSnapPoint });
	});
}