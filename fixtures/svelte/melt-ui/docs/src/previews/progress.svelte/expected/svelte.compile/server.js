import * as $ from 'svelte/internal/server';
import NumberFlow from "@number-flow/svelte";
import Preview from "@components/preview.svelte";
import { Progress } from "melt/builders";
import { Spring } from "svelte/motion";

export default function Progress_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const spring = new Spring(50, { damping: 5 });
		const progress = new Progress({ value: () => spring.current });
		const value = $.derived(() => Math.round(progress.value));

		function scaleConvert(value, from, to) {
			const [minA, maxA] = from;
			const [minB, maxB] = to;

			return (value - minA) / (maxA - minA) * (maxB - minB) + minB;
		}

		function clamp(min, value, max) {
			return Math.min(Math.max(value, min), max);
		}

		const dark = {
			h: 34,
			maxS: 81.01,
			s: () => Math.min(scaleConvert(value(), [0, 60], [0, dark.maxS]), dark.maxS),
			minL: 65.1,
			l: () => clamp(dark.minL, scaleConvert(value(), [0, 80], [100, dark.minL]), 100)
		};

		const darkClr = $.derived(() => `hsl(${dark.h}, ${dark.s()}%, ${dark.l()}%)`);

		const light = {
			h: 34,
			maxS: 81.01,
			s: () => Math.min(scaleConvert(value(), [0, 60], [0, light.maxS]), light.maxS),
			maxL: 65.1,
			l: () => clamp(40, scaleConvert(value(), [0, 80], [0, light.maxL]), light.maxL)
		};

		const lightClr = $.derived(() => `hsl(${light.h}, ${light.s()}%, ${light.l()}%)`);
		const clrClasses = "text-(--light) dark:text-(--dark)";
		const bgClasses = "bg-(--light) dark:bg-(--dark)";
		const clrStyle = $.derived(() => `--light: ${lightClr()}; --dark: ${darkClr()};`);

		Preview($$renderer, {
			class: 'place-content-center',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex flex-col items-center gap-2"${$.attr_style(clrStyle())}><span${$.attr_class($.clsx(["origin-bottom", clrClasses]))}${$.attr_style('', { scale: scaleConvert(value(), [0, 100], [1, 2]) })}>`);
				NumberFlow($$renderer, { value: value(), suffix: '%', class: 'font-semibold' });

				$$renderer.push(`<!----></span> <div${$.attributes(
					{
						...progress.root,
						class: 'relative w-[300px] overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700'
					},
					void 0,
					void 0,
					{ height: `${scaleConvert(value(), [0, 100], [8, 24])}px` }
				)}><div${$.attributes({
					...progress.progress,
					class: $.clsx(["h-full w-full -translate-x-[var(--progress)]", bgClasses])
				})}></div></div></div>`);
			},
			$$slots: { default: true }
		});
	});
}