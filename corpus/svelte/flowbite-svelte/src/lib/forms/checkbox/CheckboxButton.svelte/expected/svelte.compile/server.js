import * as $ from 'svelte/internal/server';
import Button from "$lib/buttons/Button.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import Checkbox from "./Checkbox.svelte";
import { checkboxButton } from "./theme";

export default function CheckboxButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			group = void 0,
			checked = false,
			inline,
			pill,
			outline,
			size,
			color,
			shadow,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("checkboxButton"));
		let buttonClass = $.derived(() => checkboxButton({ inline, checked, class: clsx(theme(), className) }));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, {
				tag: 'label',
				pill,
				outline,
				size,
				color,
				shadow,
				class: buttonClass(),
				children: ($$renderer) => {
					Checkbox($$renderer, $.spread_props([
						restProps,
						{
							class: 'sr-only',
							get group() {
								return group;
							},

							set group($$value) {
								group = $$value;
								$$settled = false;
							},

							get checked() {
								return checked;
							},

							set checked($$value) {
								checked = $$value;
								$$settled = false;
							}
						}
					]));

					$$renderer.push(`<!----> `);
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
		$.bind_props($$props, { group, checked });
	});
}