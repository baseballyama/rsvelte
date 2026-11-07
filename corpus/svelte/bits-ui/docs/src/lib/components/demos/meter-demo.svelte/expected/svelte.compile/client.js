import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meter, useId } from "bits-ui";

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div class="flex w-[60%] flex-col gap-2"><div class="flex items-center justify-between text-sm font-medium"><span>Tokens used</span> <span></span></div> <!></div>`);

export default function Meter_demo($$anchor, $$props) {
	$.push($$props, true);

	let value = 2000;
	const labelId = useId();
	const max = 4000;
	const min = 0;
	const usedPercentage = $.derived(() => value / max * 100);
	const percentageRemaining = $.derived(() => 100 - $.get(usedPercentage));

	const color = $.derived(() => {
		if ($.get(percentageRemaining) < 15) return "bg-red-500 dark:bg-red-400";
		if ($.get(percentageRemaining) < 35) return "bg-orange-500 dark:bg-orange-400";
		if ($.get(percentageRemaining) < 50) return "bg-yellow-500 dark:bg-yellow-400";

		return "bg-green-500 dark:bg-green-400";
	});

	var div = root_1();
	var div_1 = $.child(div);
	var span = $.child(div_1);
	var span_1 = $.sibling(span, 2);

	span_1.textContent = '2000 / 4000';
	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	$.component(node, () => Meter.Root, ($$anchor, Meter_Root) => {
		Meter_Root($$anchor, {
			get 'aria-labelledby'() {
				return labelId;
			},
			'aria-valuetext': '2000 out of 4000',
			value,
			min,
			max,
			class: 'bg-dark-10 shadow-mini-inset relative h-[15px] overflow-hidden rounded-full',
			children: ($$anchor, $$slotProps) => {
				var div_2 = root();

				$.set_style(div_2, 'transform: translateX(-50%)');
				$.template_effect(() => $.set_class(div_2, 1, `shadow-mini-inset h-full w-full flex-1 rounded-full transition-all duration-1000 ease-in-out ${$.get(color) ?? ''}`));
				$.append($$anchor, div_2);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.template_effect(() => $.set_attribute(span, 'id', labelId));
	$.append($$anchor, div);
	$.pop();
}