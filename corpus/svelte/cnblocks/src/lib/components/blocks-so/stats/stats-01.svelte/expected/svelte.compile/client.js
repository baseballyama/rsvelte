import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent } from "$lib/components/ui/card";
import { cn } from "$lib/utils";

var root = $.from_html(`<div class="text-sm font-medium text-muted-foreground"> </div> <div> </div> <div class="w-full flex-none text-3xl font-medium tracking-tight text-foreground"> </div>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-center p-10"><div class="mx-auto grid grid-cols-1 gap-px rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4"></div></div>`);

export default function Stats_01($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{
			name: "Profit",
			value: "$287,654.00",
			change: "+8.32%",
			changeType: "positive"
		},

		{
			name: "Late payments",
			value: "$9,435.00",
			change: "-12.64%",
			changeType: "negative"
		},

		{
			name: "Pending orders",
			value: "$173,229.00",
			change: "+2.87%",
			changeType: "positive"
		},

		{
			name: "Operating costs",
			value: "$52,891.00",
			change: "-5.73%",
			changeType: "negative"
		}
	];

	var div = root_1();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => data, $.index, ($$anchor, stat, index) => {
		{
			let $0 = $.derived(() => cn("rounded-none border-0 py-0 shadow-none", index === 0 && "rounded-l-xl", index === data.length - 1 && "rounded-r-xl"));

			Card($$anchor, {
				get class() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					CardContent($$anchor, {
						class: 'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var div_2 = $.first_child(fragment_2);
							var text = $.only_child(div_2, true);
							var div_3 = $.sibling(div_2, 2);
							var text_1 = $.only_child(div_3, true);
							var div_4 = $.sibling(div_3, 2);
							var text_2 = $.only_child(div_4, true);

							$.template_effect(
								($0) => {
									$.set_text(text, $.get(stat).name);
									$.set_class(div_3, 1, $0);
									$.set_text(text_1, $.get(stat).change);
									$.set_text(text_2, $.get(stat).value);
								},
								[
									() => $.clsx(cn("text-xs font-medium", $.get(stat).changeType === "positive"
										? "text-green-800 dark:text-green-400"
										: "text-red-800 dark:text-red-400"))
								]
							);

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}