import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import CircularGauge from "./circular-gauge.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<span class="font-mono text-xs font-medium text-muted-foreground tabular-nums"> </span>`);
var root_1 = $.from_html(`<a><!> <!> <!></a>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Usage_card($$anchor) {
	const items = [
		{ name: "Edge Requests", value: "$1.83K", percentage: 67.34 },
		{
			name: "Fast Data Transfer",
			percentage: 52.18,
			value: "$952.51"
		},

		{
			name: "Monitoring data points",
			percentage: 89.42,
			value: "$901.20"
		},

		{
			name: "Web Analytics Events",
			percentage: 45.67,
			value: "$603.71"
		},

		{
			name: "Edge Request CPU Duration",
			percentage: 23.91,
			value: "$4.65"
		},

		{
			name: "Fast Origin Transfer",
			percentage: 38.75,
			value: "$3.85"
		},
		{ name: "ISR Reads", percentage: 71.24, value: "$2.86" },
		{
			name: "Function Invocations",
			percentage: 15.83,
			value: "$0.60"
		},
		{ name: "ISR Writes", percentage: 26.23, value: "524.52K / 2M" },
		{
			name: "Function Duration",
			percentage: 5.11,
			value: "5.11 GB Hrs / 1K GB Hrs"
		}
	];

	Example($$anchor, {
		title: 'Usage',
		class: 'items-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full max-w-sm gap-4',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											class: 'px-1 text-sm',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('5 days remaining in cycle');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_4 = $.first_child(fragment_4);

									$.component(node_4, () => Item.Group, ($$anchor, Item_Group) => {
										Item_Group($$anchor, {
											class: 'gap-0',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_5 = $.first_child(fragment_5);

												$.each(node_5, 17, () => items, (item) => item.name, ($$anchor, item) => {
													var fragment_6 = $.comment();
													var node_6 = $.first_child(fragment_6);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;
															var a = root_1();

															$.attribute_effect(a, () => ({ href: '#/', ...props() }));

															var node_7 = $.child(a);

															$.component(node_7, () => Item.Media, ($$anchor, Item_Media) => {
																Item_Media($$anchor, {
																	variant: 'icon',
																	class: 'text-primary',
																	children: ($$anchor, $$slotProps) => {
																		CircularGauge($$anchor, {
																			get percentage() {
																				return $.get(item).percentage;
																			}
																		});
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_7, 2);

															$.component(node_8, () => Item.Content, ($$anchor, Item_Content) => {
																Item_Content($$anchor, {
																	class: 'inline-block truncate',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = $.comment();
																		var node_9 = $.first_child(fragment_8);

																		$.component(node_9, () => Item.Title, ($$anchor, Item_Title) => {
																			Item_Title($$anchor, {
																				class: 'inline',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_1 = $.text();

																					$.template_effect(() => $.set_text(text_1, $.get(item).name));
																					$.append($$anchor, text_1);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_8);
																	},
																	$$slots: { default: true }
																});
															});

															var node_10 = $.sibling(node_8, 2);

															$.component(node_10, () => Item.Actions, ($$anchor, Item_Actions) => {
																Item_Actions($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var span = root();
																		var text_2 = $.only_child(span, true);

																		$.template_effect(() => $.set_text(text_2, $.get(item).value));
																		$.append($$anchor, span);
																	},
																	$$slots: { default: true }
																});
															});

															$.reset(a);
															$.append($$anchor, a);
														};

														$.component(node_6, () => Item.Root, ($$anchor, Item_Root) => {
															Item_Root($$anchor, {
																size: 'xs',
																class: 'px-0 group-hover/item-group:bg-transparent',
																child,
																$$slots: { child: true }
															});
														});
													}

													$.append($$anchor, fragment_6);
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

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}