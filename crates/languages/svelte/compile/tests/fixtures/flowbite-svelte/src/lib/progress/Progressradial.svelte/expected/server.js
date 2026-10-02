import * as $ from 'svelte/internal/server';
import { progressradial } from "./theme";
import clsx from "clsx";
import { cubicOut } from "svelte/easing";
import { Tween } from "svelte/motion";
import { getTheme } from "$lib/theme/themeUtils";

export default function Progressradial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			progress = 45,
			radius = 42,
			startingPosition = "top",
			precision = 0,
			tweenDuration = 400,
			animate = false,
			size = "h-24 w-24",
			thickness = 4,
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

		const theme = $.derived(() => getTheme("progressradial"));
		const _progress = $.derived(() => new Tween(0, { duration: animate ? tweenDuration : 0, easing }));

		const $$d = $.derived(() => progressradial({ color, labelInside })),
			base = $.derived(() => $$d().base),
			label = $.derived(() => $$d().label),
			background = $.derived(() => $$d().background),
			foreground = $.derived(() => $$d().foreground),
			outside = $.derived(() => $$d().outside),
			span = $.derived(() => $$d().span),
			progressCls = $.derived(() => $$d().progressCls);

		// Calculate the circle properties
		let circumference = $.derived(() => 2 * Math.PI * radius);

		// let strokeDashoffset = $state()
		// Calculate the stroke-dashoffset based on progress
		let strokeDashoffset = $.derived(() => circumference() - _progress().current / 100 * circumference());

		let rotationAngle = $.derived(() => startingPosition === "top"
			? -90
			: startingPosition === "right"
				? 0
				: startingPosition === "bottom" ? 90 : startingPosition === "left" ? 180 : -90);

		let formattedProgress = $.derived(() => _progress().current.toFixed(precision));

		$$renderer.push(`<div class="flex flex-col items-center">`);

		if (labelOutside) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(outside()({ class: clsx(theme()?.outside, classes?.outside) })))}><span${$.attr_class($.clsx(span()({ class: clsx(theme()?.span, classes?.span) })))}>${$.escape(labelOutside)}</span> <span${$.attr_class($.clsx(progressCls()({ class: clsx(theme()?.progressCls, classes?.progressCls) })))}>${$.escape(formattedProgress())}%</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attributes({
			...restProps,
			class: $.clsx(base()({ class: clsx(size, theme()?.base, className) }))
		})}><svg viewBox="0 0 100 100" class="h-full w-full"${$.attr_style(`transform: rotate(${$.stringify(rotationAngle())}deg)`)}><circle cx="50" cy="50"${$.attr('r', radius)}${$.attr_class($.clsx(background()({ class: clsx(theme()?.background, classes?.background) })))} fill="none"${$.attr('stroke-width', thickness)}></circle><circle cx="50" cy="50"${$.attr('r', radius)}${$.attr_class($.clsx(foreground()({ class: clsx(theme()?.foreground, classes?.foreground) })))} fill="none"${$.attr('stroke-width', thickness)}${$.attr('stroke-dasharray', circumference())}${$.attr('stroke-dashoffset', strokeDashoffset())} stroke-linecap="round"></circle></svg> `);

		if (labelInside) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(label()({ class: clsx(theme()?.label, classes?.label) })))}>${$.escape(formattedProgress())}%</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}