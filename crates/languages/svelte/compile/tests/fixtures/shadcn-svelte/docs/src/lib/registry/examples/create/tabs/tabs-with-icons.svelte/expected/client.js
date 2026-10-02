import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Preview`, 1);
var root_1 = $.from_html(`<!> Code`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Tabs_with_icons($$anchor) {
	Example($$anchor, {
		title: 'With Icons',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
				Tabs_Root($$anchor, {
					value: 'preview',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
							Tabs_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
										Tabs_Trigger($$anchor, {
											value: 'preview',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												IconPlaceholder(node_3, {
													lucide: 'AppWindowIcon',
													tabler: 'IconAppWindow',
													hugeicons: 'CursorInWindowIcon',
													phosphor: 'AppWindowIcon',
													remixicon: 'RiWindowLine'
												});

												$.next();
												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_2, 2);

									$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
										Tabs_Trigger_1($$anchor, {
											value: 'code',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_5 = $.first_child(fragment_5);

												IconPlaceholder(node_5, {
													lucide: 'CodeIcon',
													tabler: 'IconCode',
													hugeicons: 'CodeIcon',
													phosphor: 'CodeIcon',
													remixicon: 'RiCodeLine'
												});

												$.next();
												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
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