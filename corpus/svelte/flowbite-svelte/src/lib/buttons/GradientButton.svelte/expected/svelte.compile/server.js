import * as $ from 'svelte/internal/server';
import { gradientButton } from "./theme";
import clsx from "clsx";
import Button from "./Button.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import { getButtonGroupContext } from "$lib/context";

export default function GradientButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const group = getButtonGroupContext()?.size;

		let {
			children,
			outline,
			pill,
			color = "blue",
			shadow,
			class: className,
			href,
			disabled,
			size,
			btnClass,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("gradientButton"));

		const $$d = $.derived(() => gradientButton({ color, outline, pill, shadow, disabled, size, group: !!group })),
			base = $.derived(() => $$d().base),
			outlineWrapper = $.derived(() => $$d().outlineWrapper);

		if (outline) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(base()({ class: clsx(theme()?.base, className) })))}>`);

			Button($$renderer, $.spread_props([
				restProps,
				{
					class: outlineWrapper()({ class: clsx(theme()?.outlineWrapper, btnClass) }),
					disabled,
					href,
					size,
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');

			Button($$renderer, $.spread_props([
				restProps,
				{
					class: base()({ class: clsx(theme()?.base, className) }),
					disabled,
					href,
					size,
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		$$renderer.push(`<!--]-->`);
	});
}