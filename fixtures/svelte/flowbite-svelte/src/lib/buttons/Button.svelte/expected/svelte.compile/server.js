import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { Spinner } from "$lib";
import { getTheme } from "$lib/theme/themeUtils";
import { button } from "./theme";
import { getButtonGroupContext } from "$lib/context";

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const groupCtx = getButtonGroupContext();
		const group = groupCtx?.size;
		const ctxDisabled = groupCtx?.disabled;

		let {
			children,
			pill,
			outline = false,
			size = "md",
			color,
			shadow = false,
			tag = "button",
			disabled,
			loading = false,
			spinnerProps = { size: "4" },
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("button"));
		let actualSize = $.derived(() => group ? "sm" : size);
		let actualColor = $.derived(() => color ?? (group ? outline ? "dark" : "alternative" : "primary"));
		let isDisabled = $.derived(() => Boolean(ctxDisabled) || Boolean(disabled) || loading);

		const $$d = $.derived(() => button({
				color: actualColor(),
				size: actualSize(),
				disabled: isDisabled(),
				pill,
				group: !!group
			})),
			base = $.derived(() => $$d().base),
			outline_ = $.derived(() => $$d().outline),
			shadow_ = $.derived(() => $$d().shadow),
			spinner = $.derived(() => $$d().spinner);

		let btnCls = $.derived(() => base()({
			class: clsx(outline && outline_()(), shadow && shadow_()(), theme()?.base, className)
		}));

		if (restProps.href !== undefined) {
			$$renderer.push(`<!--[0--><a${$.attributes({ ...restProps, class: $.clsx(btnCls()) })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></a>`);
		} else if (tag === "button") {
			$$renderer.push(`<!--[1--><button${$.attributes({
				type: 'button',
				...restProps,
				class: $.clsx(btnCls()),
				disabled: isDisabled()
			})}>`);

			children?.($$renderer);
			$$renderer.push(`<!----> `);

			if (loading) {
				$$renderer.push('<!--[0-->');
				Spinner($$renderer, $.spread_props([spinnerProps, { class: spinner()() }]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button>`);
		} else {
			$$renderer.push('<!--[-1-->');

			$.element(
				$$renderer,
				tag,
				() => {
					$$renderer.push(`${$.attributes({ ...restProps, class: $.clsx(btnCls()) })}`);
				},
				() => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				}
			);
		}

		$$renderer.push(`<!--]-->`);
	});
}