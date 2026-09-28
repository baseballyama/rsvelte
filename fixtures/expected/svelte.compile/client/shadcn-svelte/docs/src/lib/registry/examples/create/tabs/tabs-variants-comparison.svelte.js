import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex gap-4"><!> <!></div>`);

export default function Tabs_variants_comparison($$anchor) {
	Example($$anchor, {
		title: 'Variants Alignment',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
				Tabs_Root($$anchor, {
					value: 'overview',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
							Tabs_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_2 = $.first_child(fragment_2);

									$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
										Tabs_Trigger($$anchor, {
											value: 'overview',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Overview');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
										Tabs_Trigger_1($$anchor, {
											value: 'analytics',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Analytics');

												$.append($$anchor, text_1);
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
			});

			var node_4 = $.sibling(node, 2);

			$.component(node_4, () => Tabs.Root, ($$anchor, Tabs_Root_1) => {
				Tabs_Root_1($$anchor, {
					value: 'overview',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_5 = $.first_child(fragment_3);

						$.component(node_5, () => Tabs.List, ($$anchor, Tabs_List_1) => {
							Tabs_List_1($$anchor, {
								variant: 'line',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_6 = $.first_child(fragment_4);

									$.component(node_6, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
										Tabs_Trigger_2($$anchor, {
											value: 'overview',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Overview');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_3) => {
										Tabs_Trigger_3($$anchor, {
											value: 'analytics',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Analytics');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
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