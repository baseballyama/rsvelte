import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

export default function Claimable_balance($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Claimable Balance`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									class: 'text-5xl tabular-nums',
									children: ($$renderer) => {
										$$renderer.push(`<!---->$0.00`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

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

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						class: 'flex flex-1 flex-col justify-end',
						children: ($$renderer) => {
							if (Item.Root) {
								$$renderer.push('<!--[-->');

								Item.Root($$renderer, {
									variant: 'muted',
									class: 'flex-col items-stretch',
									children: ($$renderer) => {
										if (Item.Content) {
											$$renderer.push('<!--[-->');

											Item.Content($$renderer, {
												class: 'gap-3',
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Net Royalties</span> <span class="text-sm font-medium tabular-nums">$0.00</span></div> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Processing Fee</span> <span class="text-sm font-medium tabular-nums">-$0.00</span></div> `);
													Separator($$renderer, {});
													$$renderer.push(`<!----> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Total Ready to Claim</span> <span class="text-sm font-semibold tabular-nums">$0.00 USD</span></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Card.Footer) {
					$$renderer.push('<!--[-->');

					Card.Footer($$renderer, {
						children: ($$renderer) => {
							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Once your bank is connected, balances over $10.00 are automatically eligible for monthly
			distribution on the 15th of each month.`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}