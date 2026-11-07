import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "$lib/registry/ui/card/index.js";

import { Item, ItemContent, ItemDescription, ItemFooter, ItemGroup } from "$lib/registry/ui/item/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <span class="text-3xl font-semibold tabular-nums">$420,000</span> <!>`, 1);
var root_2 = $.from_html(`<span class="text-sm text-muted-foreground">65% achieved</span> <span class="text-sm font-medium tabular-nums">$273,000</span>`, 1);
var root_3 = $.from_html(`<!> <span class="text-3xl font-semibold tabular-nums">$85,000</span> <!>`, 1);
var root_4 = $.from_html(`<span class="text-sm text-muted-foreground">32% achieved</span> <span class="text-sm font-medium tabular-nums">$27,200</span>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);

export default function Savings_targets($$anchor) {
	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					CardTitle(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Savings Targets');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					CardDescription(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Active milestones for 2024 across your portfolio. Monitor how close you are to each savings\n			goal.');

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
					ItemGroup($$anchor, {
						class: 'gap-3',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_4 = $.first_child(fragment_4);

							Item(node_4, {
								role: 'listitem',
								variant: 'muted',
								class: 'flex-col items-stretch',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_5 = $.first_child(fragment_5);

									ItemContent(node_5, {
										class: 'gap-3',
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root_1();
											var node_6 = $.first_child(fragment_6);

											ItemDescription(node_6, {
												class: 'cn-font-heading text-xs font-medium tracking-wider text-muted-foreground uppercase',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Retirement');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});

											var node_7 = $.sibling(node_6, 4);

											Progress(node_7, { value: 65, 'aria-label': 'Retirement savings progress' });
											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});

									var node_8 = $.sibling(node_5, 2);

									ItemFooter(node_8, {
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root_2();

											$.next(2);
											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_4, 2);

							Item(node_9, {
								role: 'listitem',
								variant: 'muted',
								class: 'flex-col items-stretch',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_10 = $.first_child(fragment_8);

									ItemContent(node_10, {
										class: 'gap-3',
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root_3();
											var node_11 = $.first_child(fragment_9);

											ItemDescription(node_11, {
												class: 'cn-font-heading text-xs font-medium tracking-wider text-muted-foreground uppercase',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Real Estate');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});

											var node_12 = $.sibling(node_11, 4);

											Progress(node_12, { value: 32, 'aria-label': 'Real estate savings progress' });
											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});

									var node_13 = $.sibling(node_10, 2);

									ItemFooter(node_13, {
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = root_4();

											$.next(2);
											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_3, 2);

			CardFooter(node_14, {
				children: ($$anchor, $$slotProps) => {
					CardDescription($$anchor, {
						class: 'text-center',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('You have not met your targets for this year.');

							$.append($$anchor, text_4);
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