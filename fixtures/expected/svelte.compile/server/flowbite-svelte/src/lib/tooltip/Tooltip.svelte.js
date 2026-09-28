import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import Popper from "../utils/Popper.svelte";
import { tooltip } from "./theme";

export default function Tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			type = "dark",
			color = undefined,
			trigger = "hover",
			arrow = true,
			children,
			placement = "top",
			onbeforetoggle: _onbeforetoggle,
			class: className,
			isOpen = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const base = $.derived(() => tooltip({ color, type, class: clsx(className) }));

		function onbeforetoggle(ev) {
			// block all focusable elements inside the tooltip
			if (ev.target instanceof HTMLElement) {
				ev.target.querySelectorAll('a, button, input, textarea, select, details, [tabindex], [contenteditable="true"]').forEach((element) => element.setAttribute("tabindex", "-1"));
			}

			// bubble event to parent
			_onbeforetoggle?.(ev);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Popper($$renderer, $.spread_props([
				restProps,
				{
					placement,
					trigger,
					arrow,
					class: base(),
					onbeforetoggle,
					get isOpen() {
						return isOpen;
					},

					set isOpen($$value) {
						isOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<div class="pointer-events-none">`);
						children($$renderer);
						$$renderer.push(`<!----></div>`);
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