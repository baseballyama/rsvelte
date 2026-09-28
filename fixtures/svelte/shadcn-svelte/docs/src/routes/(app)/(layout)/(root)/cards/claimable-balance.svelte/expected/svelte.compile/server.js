import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/registry/ui/badge/index.js";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "$lib/registry/ui/card/index.js";

import { Item, ItemContent } from "$lib/registry/ui/item/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

export default function Claimable_balance($$renderer) {
	const netRoyalties = 1248.75;
	const processingFee = 37.46;
	const totalClaimable = netRoyalties - processingFee;
	const formatCurrency = (amount) => amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				children: ($$renderer) => {
					CardDescription($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Claimable Balance`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardTitle($$renderer, {
						class: 'text-4xl tabular-nums',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(formatCurrency(totalClaimable))}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Badge($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							$$renderer.push(`<span class="size-2 rounded-full bg-yellow-500"></span> Pending Setup`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				class: 'flex flex-1 flex-col justify-end',
				children: ($$renderer) => {
					Item($$renderer, {
						variant: 'muted',
						class: 'flex-col items-stretch',
						children: ($$renderer) => {
							ItemContent($$renderer, {
								class: 'gap-3',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Net Royalties</span> <span class="text-sm font-medium tabular-nums">${$.escape(formatCurrency(netRoyalties))}</span></div> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Processing Fee</span> <span class="text-sm font-medium tabular-nums">-${$.escape(formatCurrency(processingFee))}</span></div> `);
									Separator($$renderer, {});
									$$renderer.push(`<!----> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Total Ready to Claim</span> <span class="text-sm font-semibold tabular-nums">${$.escape(formatCurrency(totalClaimable))} USD</span></div>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				children: ($$renderer) => {
					CardDescription($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Once your bank is connected, balances over $10.00 are automatically eligible for monthly
			distribution on the 15th of each month.`);
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