import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/registry/ui/card/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex h-full flex-1 flex-col justify-end gap-1.5"><div class="min-h-2 rounded-t bg-chart-2"></div> <span class="text-center text-xs text-muted-foreground"> </span></div>`);
var root_2 = $.from_html(`<div class="flex h-[140px] w-full items-end gap-2" role="img" aria-label="Power usage by hour"></div> <!> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-0.5"><span class="text-sm text-muted-foreground">Currently Using</span> <span class="text-lg font-semibold tabular-nums">3.4 kW</span></div> <div class="flex flex-col gap-0.5"><span class="text-sm text-muted-foreground">Solar Gen</span> <span class="text-lg font-semibold tabular-nums">+1.2 kW</span></div></div>`, 1);

export default function Power_usage($$anchor) {
	const chartData = [
		{ hour: "6a", usage: 1.2 },
		{ hour: "8a", usage: 2.8 },
		{ hour: "10a", usage: 3.1 },
		{ hour: "12p", usage: 2.4 },
		{ hour: "2p", usage: 3.4 },
		{ hour: "4p", usage: 2.9 },
		{ hour: "6p", usage: 3.8 },
		{ hour: "8p", usage: 3.2 }
	];

	const maxUsage = Math.max(...chartData.map((item) => item.usage));

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					CardTitle(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Power Usage');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					CardDescription(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Whole Home');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			CardContent(node_3, {
				class: 'flex flex-col gap-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var div = $.first_child(fragment_3);

					$.each(div, 21, () => chartData, (item) => item.hour, ($$anchor, item) => {
						var div_1 = root_1();
						var div_2 = $.child(div_1);
						var span = $.sibling(div_2, 2);
						var text_2 = $.only_child(span, true);

						$.reset(div_1);

						$.template_effect(() => {
							$.set_style(div_2, `height: ${$.get(item).usage / maxUsage * 100}%`);
							$.set_text(text_2, $.get(item).hour);
						});

						$.append($$anchor, div_1);
					});

					$.reset(div);

					var node_4 = $.sibling(div, 2);

					Separator(node_4, {});
					$.next(2);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}