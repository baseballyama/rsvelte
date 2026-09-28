import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/registry/ui/select/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

const chartLineIcon = ($$anchor) => {
	IconPlaceholder($$anchor, {
		lucide: 'ChartLineIcon',
		tabler: 'IconChartLine',
		hugeicons: 'Chart03Icon',
		phosphor: 'ChartLineIcon',
		remixicon: 'RiLineChartLine'
	});
};

const chartBarIcon = ($$anchor) => {
	IconPlaceholder($$anchor, {
		lucide: 'ChartBarIcon',
		tabler: 'IconChartBar',
		hugeicons: 'Chart03Icon',
		phosphor: 'ChartBarIcon',
		remixicon: 'RiBarChartLine'
	});
};

const chartPieIcon = ($$anchor) => {
	IconPlaceholder($$anchor, {
		lucide: 'ChartPieIcon',
		tabler: 'IconChartPie',
		hugeicons: 'Chart03Icon',
		phosphor: 'ChartPieIcon',
		remixicon: 'RiPieChartLine'
	});
};

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Select_with_icons($$anchor) {
	const items = $.derived(() => [
		{ label: "Line", value: "line", icon: chartLineIcon },
		{ label: "Bar", value: "bar", icon: chartBarIcon },
		{ label: "Pie", value: "pie", icon: chartPieIcon }
	]);

	let selectedValueSm = $.state(undefined);
	let selectedValueDefault = $.state(undefined);
	const selectedItemSm = $.derived(() => $.get(items).find((item) => item.value === $.get(selectedValueSm)));
	const selectedItemDefault = $.derived(() => $.get(items).find((item) => item.value === $.get(selectedValueDefault)));

	Example($$anchor, {
		title: 'With Icons',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					get value() {
						return $.get(selectedValueSm);
					},

					set value($$value) {
						$.set(selectedValueSm, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_1();
						var node_1 = $.first_child(fragment_4);

						$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_2 = $.first_child(fragment_5);

									{
										var consequent = ($$anchor) => {
											var fragment_6 = $.comment();
											var node_3 = $.first_child(fragment_6);

											$.snippet(node_3, () => $.get(selectedItemSm).icon);
											$.append($$anchor, fragment_6);
										};

										$.if(node_2, ($$render) => {
											if ($.get(selectedItemSm)) $$render(consequent);
										});
									}

									var text = $.sibling(node_2);

									$.template_effect(() => $.set_text(text, ` ${$.get(selectedItemSm)?.label ?? "Chart Type" ?? ''}`));
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_5 = $.first_child(fragment_7);

									$.component(node_5, () => Select.Group, ($$anchor, Select_Group) => {
										Select_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = $.comment();
												var node_6 = $.first_child(fragment_8);

												$.each(node_6, 17, () => $.get(items), (item) => item.value, ($$anchor, item) => {
													var fragment_9 = $.comment();
													var node_7 = $.first_child(fragment_9);

													$.component(node_7, () => Select.Item, ($$anchor, Select_Item) => {
														Select_Item($$anchor, {
															get value() {
																return $.get(item).value;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root();
																var node_8 = $.first_child(fragment_10);

																$.snippet(node_8, () => $.get(item).icon);

																var text_1 = $.sibling(node_8);

																$.template_effect(() => $.set_text(text_1, ` ${$.get(item).label ?? ''}`));
																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			var node_9 = $.sibling(node, 2);

			$.component(node_9, () => Select.Root, ($$anchor, Select_Root_1) => {
				Select_Root_1($$anchor, {
					type: 'single',
					get value() {
						return $.get(selectedValueDefault);
					},

					set value($$value) {
						$.set(selectedValueDefault, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root_1();
						var node_10 = $.first_child(fragment_11);

						$.component(node_10, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
							Select_Trigger_1($$anchor, {
								size: 'default',
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root();
									var node_11 = $.first_child(fragment_12);

									{
										var consequent_1 = ($$anchor) => {
											var fragment_13 = $.comment();
											var node_12 = $.first_child(fragment_13);

											$.snippet(node_12, () => $.get(selectedItemDefault).icon);
											$.append($$anchor, fragment_13);
										};

										$.if(node_11, ($$render) => {
											if ($.get(selectedItemDefault)) $$render(consequent_1);
										});
									}

									var text_2 = $.sibling(node_11);

									$.template_effect(() => $.set_text(text_2, ` ${$.get(selectedItemDefault)?.label ?? "Chart Type" ?? ''}`));
									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});
						});

						var node_13 = $.sibling(node_10, 2);

						$.component(node_13, () => Select.Content, ($$anchor, Select_Content_1) => {
							Select_Content_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = $.comment();
									var node_14 = $.first_child(fragment_14);

									$.component(node_14, () => Select.Group, ($$anchor, Select_Group_1) => {
										Select_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_15 = $.comment();
												var node_15 = $.first_child(fragment_15);

												$.each(node_15, 17, () => $.get(items), (item) => item.value, ($$anchor, item) => {
													var fragment_16 = $.comment();
													var node_16 = $.first_child(fragment_16);

													$.component(node_16, () => Select.Item, ($$anchor, Select_Item_1) => {
														Select_Item_1($$anchor, {
															get value() {
																return $.get(item).value;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_17 = root();
																var node_17 = $.first_child(fragment_17);

																$.snippet(node_17, () => $.get(item).icon);

																var text_3 = $.sibling(node_17);

																$.template_effect(() => $.set_text(text_3, ` ${$.get(item).label ?? ''}`));
																$.append($$anchor, fragment_17);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_16);
												});

												$.append($$anchor, fragment_15);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}