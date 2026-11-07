import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<span class="size-2 rounded-full bg-yellow-500"></span> Pending Setup`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Net Royalties</span> <span class="text-sm font-medium tabular-nums">$0.00</span></div> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Processing Fee</span> <span class="text-sm font-medium tabular-nums">-$0.00</span></div> <!> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Total Ready to Claim</span> <span class="text-sm font-semibold tabular-nums">$0.00 USD</span></div>`, 1);

export default function Claimable_balance($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Claimable Balance');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'text-5xl tabular-nums',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('$0.00');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							Badge(node_4, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();

									$.next();
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-1 flex-col justify-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							$.component(node_6, () => Item.Root, ($$anchor, Item_Root) => {
								Item_Root($$anchor, {
									variant: 'muted',
									class: 'flex-col items-stretch',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_7 = $.first_child(fragment_5);

										$.component(node_7, () => Item.Content, ($$anchor, Item_Content) => {
											Item_Content($$anchor, {
												class: 'gap-3',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_2();
													var node_8 = $.sibling($.first_child(fragment_6), 4);

													Separator(node_8, {});
													$.next(2);
													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_5, 2);

				$.component(node_9, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_10 = $.first_child(fragment_7);

							$.component(node_10, () => Card.Description, ($$anchor, Card_Description_1) => {
								Card_Description_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Once your bank is connected, balances over $10.00 are automatically eligible for monthly\n			distribution on the 15th of each month.');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}