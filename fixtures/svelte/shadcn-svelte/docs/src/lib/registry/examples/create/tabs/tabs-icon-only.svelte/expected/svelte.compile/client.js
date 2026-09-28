import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Tabs_icon_only($$anchor) {
	Example($$anchor, {
		title: 'Icon Only',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
				Tabs_Root($$anchor, {
					value: 'home',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
							Tabs_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
										Tabs_Trigger($$anchor, {
											value: 'home',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'HomeIcon',
													tabler: 'IconHome',
													hugeicons: 'HomeIcon',
													phosphor: 'HouseIcon',
													remixicon: 'RiHomeLine'
												});
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
										Tabs_Trigger_1($$anchor, {
											value: 'search',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'SearchIcon',
													tabler: 'IconSearch',
													hugeicons: 'SearchIcon',
													phosphor: 'MagnifyingGlassIcon',
													remixicon: 'RiSearchLine'
												});
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
										Tabs_Trigger_2($$anchor, {
											value: 'settings',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'SettingsIcon',
													tabler: 'IconSettings',
													hugeicons: 'SettingsIcon',
													phosphor: 'GearIcon',
													remixicon: 'RiSettingsLine'
												});
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