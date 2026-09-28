import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<span class="size-2 rounded-full bg-yellow-500"></span> Pending Setup`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Net Royalties</span> <span class="text-sm font-medium tabular-nums"> </span></div> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Processing Fee</span> <span class="text-sm font-medium tabular-nums"> </span></div> <!> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Total Ready to Claim</span> <span class="text-sm font-semibold tabular-nums"> </span></div>`, 1);

export default function Claimable_balance($$anchor) {
	const netRoyalties = 1248.75;
	const processingFee = 37.46;
	const totalClaimable = netRoyalties - processingFee;
	const formatCurrency = (amount) => amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					CardDescription(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Claimable Balance');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					CardTitle(node_2, {
						class: 'text-4xl tabular-nums',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(($0) => $.set_text(text_1, $0), [() => formatCurrency(totalClaimable)]);
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Badge(node_3, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();

							$.next();
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			CardContent(node_4, {
				class: 'flex flex-1 flex-col justify-end',
				children: ($$anchor, $$slotProps) => {
					Item($$anchor, {
						variant: 'muted',
						class: 'flex-col items-stretch',
						children: ($$anchor, $$slotProps) => {
							ItemContent($$anchor, {
								class: 'gap-3',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_2();
									var div = $.first_child(fragment_7);
									var span = $.sibling($.child(div), 2);
									var text_2 = $.only_child(span, true);

									$.reset(div);

									var div_1 = $.sibling(div, 2);
									var span_1 = $.sibling($.child(div_1), 2);
									var text_3 = $.only_child(span_1);

									$.reset(div_1);

									var node_5 = $.sibling(div_1, 2);

									Separator(node_5, {});

									var div_2 = $.sibling(node_5, 2);
									var span_2 = $.sibling($.child(div_2), 2);
									var text_4 = $.only_child(span_2);

									$.reset(div_2);

									$.template_effect(
										($0, $1, $2) => {
											$.set_text(text_2, $0);
											$.set_text(text_3, `-${$1 ?? ''}`);
											$.set_text(text_4, `${$2 ?? ''} USD`);
										},
										[
											() => formatCurrency(netRoyalties),
											() => formatCurrency(processingFee),
											() => formatCurrency(totalClaimable)
										]
									);

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			CardFooter(node_6, {
				children: ($$anchor, $$slotProps) => {
					CardDescription($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Once your bank is connected, balances over $10.00 are automatically eligible for monthly\n			distribution on the 15th of each month.');

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