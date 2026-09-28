import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NumberFlow from "@number-flow/svelte";
import Preview from "@components/preview.svelte";
import { Progress } from "melt/builders";
import { Spring } from "svelte/motion";

var root = $.from_html(`<div class="flex flex-col items-center gap-2"><span><!></span> <div><div></div></div></div>`);

export default function Progress_1($$anchor, $$props) {
	$.push($$props, true);

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

	$.user_effect(() => {
		progress.value = scaleConvert($.get(value), [0, 100], [1, 0]);
	});

	$.user_effect(() => {
		progress.value = scaleConvert(spring.current, [0, 100], [1, 0]);
	});

	$.user_effect(() => {
		const interval = setInterval(
			() => {
				spring.target = Math.round(Math.random() * 100);
			},
			2000
		);

		return () => {
			clearInterval(interval);
		};
	});

	const dark = {
		h: 34,
		maxS: 81.01,
		s: () => Math.min(scaleConvert($.get(value), [0, 60], [0, dark.maxS]), dark.maxS),
		minL: 65.1,
		l: () => clamp(dark.minL, scaleConvert($.get(value), [0, 80], [100, dark.minL]), 100)
	};

	const darkClr = $.derived(() => `hsl(${dark.h}, ${dark.s()}%, ${dark.l()}%)`);

	const light = {
		h: 34,
		maxS: 81.01,
		s: () => Math.min(scaleConvert($.get(value), [0, 60], [0, light.maxS]), light.maxS),
		maxL: 65.1,
		l: () => clamp(40, scaleConvert($.get(value), [0, 80], [0, light.maxL]), light.maxL)
	};

	const lightClr = $.derived(() => `hsl(${light.h}, ${light.s()}%, ${light.l()}%)`);
	const clrClasses = "text-(--light) dark:text-(--dark)";
	const bgClasses = "bg-(--light) dark:bg-(--dark)";
	const clrStyle = $.derived(() => `--light: ${$.get(lightClr)}; --dark: ${$.get(darkClr)};`);

	Preview($$anchor, {
		class: 'place-content-center',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var span = $.child(div);

			$.set_class(span, 1, $.clsx(["origin-bottom", clrClasses]));

			let styles;
			var node = $.child(span);

			NumberFlow(node, {
				get value() {
					return $.get(value);
				},
				suffix: '%',
				class: 'font-semibold'
			});

			$.reset(span);

			var div_1 = $.sibling(span, 2);

			$.attribute_effect(
				div_1,
				($0) => ({
					...progress.root,
					class: 'relative w-[300px] overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700',
					[$.STYLE]: { height: $0 }
				}),
				[() => `${scaleConvert($.get(value), [0, 100], [8, 24])}px`]
			);

			var div_2 = $.child(div_1);

			$.attribute_effect(div_2, () => ({
				...progress.progress,
				class: ["h-full w-full -translate-x-[var(--progress)]", bgClasses]
			}));

			$.reset(div_1);
			$.reset(div);

			$.template_effect(
				($0) => {
					$.set_style(div, $.get(clrStyle));
					styles = $.set_style(span, '', styles, { scale: $0 });
				},
				[() => scaleConvert($.get(value), [0, 100], [1, 2])]
			);

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}