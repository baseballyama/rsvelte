import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="border style-vega:rounded-lg style-vega:p-6 style-nova:rounded-lg style-nova:p-4 style-lyra:rounded-none style-lyra:p-4 style-maia:rounded-xl style-maia:p-6 style-mira:rounded-md style-mira:p-4 style-luma:rounded-xl style-luma:p-6 style-rhea:rounded-xl style-rhea:p-6"><!> <!> <!></div>`, 1);

export default function Tabs_vertical($$anchor) {
	Example($$anchor, {
		title: 'Vertical',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
				Tabs_Root($$anchor, {
					value: 'account',
					orientation: 'vertical',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
							Tabs_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
										Tabs_Trigger($$anchor, {
											value: 'account',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Account');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
										Tabs_Trigger_1($$anchor, {
											value: 'password',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Password');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
										Tabs_Trigger_2($$anchor, {
											value: 'notifications',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Notifications');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var div = $.sibling(node_1, 2);
						var node_5 = $.child(div);

						$.component(node_5, () => Tabs.Content, ($$anchor, Tabs_Content) => {
							Tabs_Content($$anchor, {
								value: 'account',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Manage your account preferences and profile information.');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_5, 2);

						$.component(node_6, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
							Tabs_Content_1($$anchor, {
								value: 'password',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Update your password to keep your account secure. Use a strong password with a mix of\n				letters, numbers, and symbols.');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
							Tabs_Content_2($$anchor, {
								value: 'notifications',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Configure how you receive notifications and alerts. Choose which types of notifications you\n				want to receive and how you want to receive them.');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div);
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