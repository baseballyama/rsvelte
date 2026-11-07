import * as $ from 'svelte/internal/server';
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

export default function Dividend_income($$renderer) {
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

	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				children: ($$renderer) => {
					CardTitle($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Q2 Dividend Income`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardDescription($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Quarterly dividend payouts across your portfolio holdings.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardAction($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'ghost',
								size: 'icon-sm',
								class: 'bg-muted',
								'aria-label': 'Dismiss dividend income',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
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

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					ItemGroup($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(HOLDINGS);

							for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
								let holding = each_array[$$index_1];
								const maxDividend = Math.max(1, ...holding.data.map((point) => point.value));

								Item($$renderer, {
									role: 'listitem',
									variant: 'muted',
									children: ($$renderer) => {
										ItemContent($$renderer, {
											children: ($$renderer) => {
												ItemTitle($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(holding.name)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												ItemDescription($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(holding.shares)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="hidden h-8 w-24 items-end gap-1 md:flex" role="img"${$.attr('aria-label', `${$.stringify(holding.name)} quarterly dividends`)}><!--[-->`);

										const each_array_1 = $.ensure_array_like(holding.data);

										for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
											let item = each_array_1[$$index];

											$$renderer.push(`<div class="min-h-1 flex-1 rounded-t-sm bg-chart-2"${$.attr_style(`height: ${item.value / maxDividend * 100}%`)}></div>`);
										}

										$$renderer.push(`<!--]--></div>`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}