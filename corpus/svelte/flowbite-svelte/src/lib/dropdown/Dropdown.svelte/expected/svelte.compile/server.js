import * as $ from 'svelte/internal/server';
import Popper from "$lib/utils/Popper.svelte";
import DropdownGroup from "./DropdownGroup.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { setDropdownContext } from "$lib/context";
import { dropdown } from "./theme";

export default function Dropdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			simple = false,
			placement = "bottom",
			offset = 2,
			class: className,
			activeUrl = "",
			isOpen = false,
			onclose,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("dropdown"));
		const base = $.derived(() => dropdown({ class: clsx(theme(), className) }));

		// Create reactive context using getter
		const context = {
			get activeUrl() {
				return activeUrl ?? "";
			}
		};

		setDropdownContext(context);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Popper($$renderer, $.spread_props([
				restProps,
				{
					placement,
					offset,
					class: base(),
					get isOpen() {
						return isOpen;
					},

					set isOpen($$value) {
						isOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (simple) {
							$$renderer.push('<!--[0-->');

							DropdownGroup($$renderer, {
								children: ($$renderer) => {
									children($$renderer);
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
							children($$renderer);
							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { isOpen });
	});
}