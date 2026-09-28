import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "$lib/registry/ui/card/index.js";

import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "$lib/registry/ui/item/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="min-h-1 flex-1 rounded-t-sm bg-chart-2"></div>`);
var root_3 = $.from_html(`<!> <div class="hidden h-8 w-24 items-end gap-1 md:flex" role="img"></div>`, 1);

export default function Dividend_income($$anchor) {
	const HOLDINGS = [
		{
			name: "Vanguard",
			shares: "450 Shares",
			amount: "$1,842.10",
			data: [
				{ q: "Q1", value: 380 },
				{ q: "Q2", value: 420 },
				{ q: "Q3", value: 390 },
				{ q: "Q4", value: 652 }
			]
		},

		{
			name: "S&P 500 VOO",
			shares: "112 Shares",
			amount: "$928.40",
			data: [
				{ q: "Q1", value: 180 },
				{ q: "Q2", value: 210 },
				{ q: "Q3", value: 320 },
				{ q: "Q4", value: 218 }
			]
		},

		{
			name: "Apple AAPL",
			shares: "85 Shares",
			amount: "$340.00",
			data: [
				{ q: "Q1", value: 60 },
				{ q: "Q2", value: 70 },
				{ q: "Q3", value: 120 },
				{ q: "Q4", value: 90 }
			]
		},

		{
			name: "Realty Income",
			shares: "320 Shares",
			amount: "$1,139.50",
			data: [
				{ q: "Q1", value: 240 },
				{ q: "Q2", value: 260 },
				{ q: "Q3", value: 280 },
				{ q: "Q4", value: 360 }
			]
		}
	];

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					CardTitle(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Q2 Dividend Income');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					CardDescription(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Quarterly dividend payouts across your portfolio holdings.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					CardAction(node_3, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'ghost',
								size: 'icon-sm',
								class: 'bg-muted',
								'aria-label': 'Dismiss dividend income',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'XIcon',
										tabler: 'IconX',
										hugeicons: 'Cancel01Icon',
										phosphor: 'XIcon',
										remixicon: 'RiCloseLine'
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			CardContent(node_4, {
				children: ($$anchor, $$slotProps) => {
					ItemGroup($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_5 = $.first_child(fragment_6);

							$.each(node_5, 17, () => HOLDINGS, (holding) => holding.name, ($$anchor, holding) => {
								const maxDividend = $.derived(() => Math.max(1, ...$.get(holding).data.map((point) => point.value)));

								Item($$anchor, {
									role: 'listitem',
									variant: 'muted',
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_3();
										var node_6 = $.first_child(fragment_8);

										ItemContent(node_6, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_1();
												var node_7 = $.first_child(fragment_9);

												ItemTitle(node_7, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text();

														$.template_effect(() => $.set_text(text_2, $.get(holding).name));
														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});

												var node_8 = $.sibling(node_7, 2);

												ItemDescription(node_8, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text();

														$.template_effect(() => $.set_text(text_3, $.get(holding).shares));
														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});

										var div = $.sibling(node_6, 2);

										$.each(div, 21, () => $.get(holding).data, (item) => item.q, ($$anchor, item) => {
											var div_1 = root_2();

											$.template_effect(() => $.set_style(div_1, `height: ${$.get(item).value / $.get(maxDividend) * 100}%`));
											$.append($$anchor, div_1);
										});

										$.reset(div);
										$.template_effect(() => $.set_attribute(div, 'aria-label', `${$.get(holding).name ?? ''} quarterly dividends`));
										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
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