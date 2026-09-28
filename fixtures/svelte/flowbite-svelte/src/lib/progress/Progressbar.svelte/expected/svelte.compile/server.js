import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { cubicOut } from "svelte/easing";
import { Tween } from "svelte/motion";
import { progressbar } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function Progressbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			progress = "45",
			precision = 0,
			tweenDuration = 400,
			animate = false,
			size = "h-2.5",
			labelInside = false,
			labelOutside = "",
			easing = cubicOut,
			color = "primary",
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("progressbar"));
		let _progress = $.derived(() => new Tween(0, { duration: animate ? tweenDuration : 0, easing }));

		const $$d = $.derived(() => progressbar({ color, labelInside })),
			base = $.derived(() => $$d().base),
			labelInsideCls = $.derived(() => $$d().label),
			inside = $.derived(() => $$d().inside),
			outside = $.derived(() => $$d().outside),
			span = $.derived(() => $$d().span),
			progressCls = $.derived(() => $$d().progressCls);

		if (labelOutside) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				...restProps,
				class: $.clsx(outside()({ class: clsx(theme()?.outside, classes?.outside) }))
			})}><span${$.attr_class($.clsx(span()({ class: clsx(theme()?.span, classes?.span) })))}>${$.escape(labelOutside)}</span> <span${$.attr_class($.clsx(progressCls()({ class: clsx(theme()?.progressCls, classes?.progressCls) })))}>${$.escape(progress)}%</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attributes({
			...restProps,
			class: $.clsx(base()({ class: clsx(size, theme()?.base, className) }))
		})}>`);

		if (labelInside) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(labelInsideCls()({ class: clsx(size, theme()?.label, classes?.label) })))}${$.attr_style(`width: ${$.stringify(_progress().current)}%`)}>${$.escape(_progress().current.toFixed(precision))}%</div>`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(inside()({ class: clsx(size, theme()?.inside, classes?.label) })))}${$.attr_style(`width: ${$.stringify(_progress().current)}%`)}></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}