import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "$lib/registry/ui/card/index.js";

import { Item, ItemContent, ItemDescription } from "$lib/registry/ui/item/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex h-full flex-1 flex-col justify-end gap-2"><div class="min-h-2 rounded-t-md bg-chart-2"></div> <span class="text-center text-xs text-muted-foreground"> </span></div>`);
var root_2 = $.from_html(`<div class="flex h-[200px] w-full items-end gap-3" role="img" aria-label="Last 6 months of contribution activity"></div>`);
var root_3 = $.from_html(`<!> <span class="cn-font-heading text-base font-semibold">May 2024</span> <span class="text-sm text-muted-foreground">Scheduled</span>`, 1);
var root_4 = $.from_html(`<!> <span class="cn-font-heading text-base font-semibold">Accelerated</span> <span class="text-sm text-muted-foreground">Recurring</span>`, 1);
var root_5 = $.from_html(`<div class="grid w-full grid-cols-1 gap-3 xl:grid-cols-2"><!> <!></div>`);
var root_6 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Contribution_history($$anchor) {
	const chartData = [
		{ month: "Dec", amount: 800 },
		{ month: "Jan", amount: 1100 },
		{ month: "Feb", amount: 900 },
		{ month: "Mar", amount: 1300 },
		{ month: "Apr", amount: 750 },
		{ month: "May", amount: 1400 }
	];

	const maxAmount = Math.max(...chartData.map((item) => item.amount));

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_6();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					CardTitle(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Contribution History');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					CardDescription(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Last 6 months of activity');

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
				children: ($$anchor, $$slotProps) => {
					var div = root_2();

					$.each(div, 21, () => chartData, (item) => item.month, ($$anchor, item) => {
						var div_1 = root_1();
						var div_2 = $.child(div_1);
						var span = $.sibling(div_2, 2);
						var text_2 = $.only_child(span, true);

						$.reset(div_1);

						$.template_effect(() => {
							$.set_style(div_2, `height: ${$.get(item).amount / maxAmount * 100}%`);
							$.set_text(text_2, $.get(item).month);
						});

						$.append($$anchor, div_1);
					});

					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			CardContent(node_4, {
				children: ($$anchor, $$slotProps) => {
					var div_3 = root_5();
					var node_5 = $.child(div_3);

					Item(node_5, {
						variant: 'muted',
						class: 'flex-col items-stretch',
						children: ($$anchor, $$slotProps) => {
							ItemContent($$anchor, {
								class: 'gap-1',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_3();
									var node_6 = $.first_child(fragment_4);

									ItemDescription(node_6, {
										class: 'text-xs font-medium tracking-wider text-muted-foreground uppercase',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Upcoming');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.next(4);
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_5, 2);

					Item(node_7, {
						variant: 'muted',
						class: 'hidden flex-col items-stretch xl:flex',
						children: ($$anchor, $$slotProps) => {
							ItemContent($$anchor, {
								class: 'gap-1',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_4();
									var node_8 = $.first_child(fragment_6);

									ItemDescription(node_8, {
										class: 'text-xs font-medium tracking-wider text-muted-foreground uppercase',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Savings Plan');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									$.next(4);
									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.reset(div_3);
					$.append($$anchor, div_3);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_4, 2);

			CardFooter(node_9, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('View Full Report');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}