import * as $ from 'svelte/internal/server';
import { Meter, useId } from "bits-ui";

export default function Meter_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = 2000;
		const labelId = useId();
		const max = 4000;
		const min = 0;
		const usedPercentage = $.derived(() => value / max * 100);
		const percentageRemaining = $.derived(() => 100 - usedPercentage());

		const color = $.derived(() => {
			if (percentageRemaining() < 15) return "bg-red-500 dark:bg-red-400";
			if (percentageRemaining() < 35) return "bg-orange-500 dark:bg-orange-400";
			if (percentageRemaining() < 50) return "bg-yellow-500 dark:bg-yellow-400";

			return "bg-green-500 dark:bg-green-400";
		});

		$$renderer.push(`<div class="flex w-[60%] flex-col gap-2"><div class="flex items-center justify-between text-sm font-medium"><span${$.attr('id', labelId)}>Tokens used</span> <span>2000 / 4000</span></div> `);

		if (Meter.Root) {
			$$renderer.push('<!--[-->');

			Meter.Root($$renderer, {
				'aria-labelledby': labelId,
				'aria-valuetext': '2000 out of 4000',
				value,
				min,
				max,
				class: 'bg-dark-10 shadow-mini-inset relative h-[15px] overflow-hidden rounded-full',
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attr_class(`shadow-mini-inset h-full w-full flex-1 rounded-full transition-all duration-1000 ease-in-out ${$.stringify(color())}`)} style="transform: translateX(-50%)"></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}