import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TrendingDownIcon from "@tabler/icons-svelte/icons/trending-down";
import TrendingUpIcon from "@tabler/icons-svelte/icons/trending-up";
import * as Card from "$lib/registry/ui/card/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";

var root = $.from_html(`<!> +12.5%`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="line-clamp-1 flex gap-2 font-medium">Trending up this month <!></div> <div class="text-muted-foreground">Visitors for the last 6 months</div>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> -20%`, 1);
var root_5 = $.from_html(`<div class="line-clamp-1 flex gap-2 font-medium">Down 20% this period <!></div> <div class="text-muted-foreground">Acquisition needs attention</div>`, 1);
var root_6 = $.from_html(`<div class="line-clamp-1 flex gap-2 font-medium">Strong user retention <!></div> <div class="text-muted-foreground">Engagement exceed targets</div>`, 1);
var root_7 = $.from_html(`<!> +4.5%`, 1);
var root_8 = $.from_html(`<div class="line-clamp-1 flex gap-2 font-medium">Steady performance increase <!></div> <div class="text-muted-foreground">Meets growth projections</div>`, 1);
var root_9 = $.from_html(`<div class="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4"><!> <!> <!> <!></div>`);

export default function Section_cards($$anchor) {
	var div = root_9();
	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: '@container/card',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_3();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Total Revenue');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'text-2xl font-semibold tabular-nums @[250px]/card:text-3xl',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('$1,250.00');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Badge($$anchor, {
											variant: 'outline',
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = root();
												var node_5 = $.first_child(fragment_3);

												TrendingUpIcon(node_5, {});
												$.next();
												$.append($$anchor, fragment_3);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_1, 2);

				$.component(node_6, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col items-start gap-1.5 text-sm',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_2();
							var div_1 = $.first_child(fragment_4);
							var node_7 = $.sibling($.child(div_1));

							TrendingUpIcon(node_7, { class: 'size-4' });
							$.reset(div_1);
							$.next(2);
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node, 2);

	$.component(node_8, () => Card.Root, ($$anchor, Card_Root_1) => {
		Card_Root_1($$anchor, {
			class: '@container/card',
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_3();
				var node_9 = $.first_child(fragment_5);

				$.component(node_9, () => Card.Header, ($$anchor, Card_Header_1) => {
					Card_Header_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_1();
							var node_10 = $.first_child(fragment_6);

							$.component(node_10, () => Card.Description, ($$anchor, Card_Description_1) => {
								Card_Description_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('New Customers');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => Card.Title, ($$anchor, Card_Title_1) => {
								Card_Title_1($$anchor, {
									class: 'text-2xl font-semibold tabular-nums @[250px]/card:text-3xl',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('1,234');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_11, 2);

							$.component(node_12, () => Card.Action, ($$anchor, Card_Action_1) => {
								Card_Action_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Badge($$anchor, {
											variant: 'outline',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_4();
												var node_13 = $.first_child(fragment_8);

												TrendingDownIcon(node_13, {});
												$.next();
												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				var node_14 = $.sibling(node_9, 2);

				$.component(node_14, () => Card.Footer, ($$anchor, Card_Footer_1) => {
					Card_Footer_1($$anchor, {
						class: 'flex-col items-start gap-1.5 text-sm',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_5();
							var div_2 = $.first_child(fragment_9);
							var node_15 = $.sibling($.child(div_2));

							TrendingDownIcon(node_15, { class: 'size-4' });
							$.reset(div_2);
							$.next(2);
							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	var node_16 = $.sibling(node_8, 2);

	$.component(node_16, () => Card.Root, ($$anchor, Card_Root_2) => {
		Card_Root_2($$anchor, {
			class: '@container/card',
			children: ($$anchor, $$slotProps) => {
				var fragment_10 = root_3();
				var node_17 = $.first_child(fragment_10);

				$.component(node_17, () => Card.Header, ($$anchor, Card_Header_2) => {
					Card_Header_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root_1();
							var node_18 = $.first_child(fragment_11);

							$.component(node_18, () => Card.Description, ($$anchor, Card_Description_2) => {
								Card_Description_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Active Accounts');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							var node_19 = $.sibling(node_18, 2);

							$.component(node_19, () => Card.Title, ($$anchor, Card_Title_2) => {
								Card_Title_2($$anchor, {
									class: 'text-2xl font-semibold tabular-nums @[250px]/card:text-3xl',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('45,678');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							});

							var node_20 = $.sibling(node_19, 2);

							$.component(node_20, () => Card.Action, ($$anchor, Card_Action_2) => {
								Card_Action_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Badge($$anchor, {
											variant: 'outline',
											children: ($$anchor, $$slotProps) => {
												var fragment_13 = root();
												var node_21 = $.first_child(fragment_13);

												TrendingUpIcon(node_21, {});
												$.next();
												$.append($$anchor, fragment_13);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				});

				var node_22 = $.sibling(node_17, 2);

				$.component(node_22, () => Card.Footer, ($$anchor, Card_Footer_2) => {
					Card_Footer_2($$anchor, {
						class: 'flex-col items-start gap-1.5 text-sm',
						children: ($$anchor, $$slotProps) => {
							var fragment_14 = root_6();
							var div_3 = $.first_child(fragment_14);
							var node_23 = $.sibling($.child(div_3));

							TrendingUpIcon(node_23, { class: 'size-4' });
							$.reset(div_3);
							$.next(2);
							$.append($$anchor, fragment_14);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_10);
			},
			$$slots: { default: true }
		});
	});

	var node_24 = $.sibling(node_16, 2);

	$.component(node_24, () => Card.Root, ($$anchor, Card_Root_3) => {
		Card_Root_3($$anchor, {
			class: '@container/card',
			children: ($$anchor, $$slotProps) => {
				var fragment_15 = root_3();
				var node_25 = $.first_child(fragment_15);

				$.component(node_25, () => Card.Header, ($$anchor, Card_Header_3) => {
					Card_Header_3($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_1();
							var node_26 = $.first_child(fragment_16);

							$.component(node_26, () => Card.Description, ($$anchor, Card_Description_3) => {
								Card_Description_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Growth Rate');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							});

							var node_27 = $.sibling(node_26, 2);

							$.component(node_27, () => Card.Title, ($$anchor, Card_Title_3) => {
								Card_Title_3($$anchor, {
									class: 'text-2xl font-semibold tabular-nums @[250px]/card:text-3xl',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text('4.5%');

										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});
							});

							var node_28 = $.sibling(node_27, 2);

							$.component(node_28, () => Card.Action, ($$anchor, Card_Action_3) => {
								Card_Action_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Badge($$anchor, {
											variant: 'outline',
											children: ($$anchor, $$slotProps) => {
												var fragment_18 = root_7();
												var node_29 = $.first_child(fragment_18);

												TrendingUpIcon(node_29, {});
												$.next();
												$.append($$anchor, fragment_18);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});
				});

				var node_30 = $.sibling(node_25, 2);

				$.component(node_30, () => Card.Footer, ($$anchor, Card_Footer_3) => {
					Card_Footer_3($$anchor, {
						class: 'flex-col items-start gap-1.5 text-sm',
						children: ($$anchor, $$slotProps) => {
							var fragment_19 = root_8();
							var div_4 = $.first_child(fragment_19);
							var node_31 = $.sibling($.child(div_4));

							TrendingUpIcon(node_31, { class: 'size-4' });
							$.reset(div_4);
							$.next(2);
							$.append($$anchor, fragment_19);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_15);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}