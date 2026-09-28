import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-4"><!> <div class="ml-auto flex items-center gap-2"><!> <!></div></div> <div class="border style-vega:rounded-lg style-vega:p-6 style-nova:rounded-lg style-nova:p-4 style-lyra:rounded-none style-lyra:p-4 style-maia:rounded-xl style-maia:p-6 style-mira:rounded-md style-mira:p-4 style-luma:rounded-xl style-luma:p-6 style-rhea:rounded-xl style-rhea:p-6"><!> <!> <!></div>`, 1);

export default function Tabs_with_input_and_button($$anchor) {
	Example($$anchor, {
		title: 'With Input and Button',
		containerClass: 'col-span-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
				Tabs_Root($$anchor, {
					value: 'overview',
					class: 'mx-auto w-full max-w-lg',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var div = $.first_child(fragment_2);
						var node_1 = $.child(div);

						$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
							Tabs_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

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

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var div_1 = $.sibling(node_1, 2);
						var node_4 = $.child(div_1);

						Input(node_4, { placeholder: 'Search...', class: 'w-44' });

						var node_5 = $.sibling(node_4, 2);

						Button(node_5, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Action');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						$.reset(div_1);
						$.reset(div);

						var div_2 = $.sibling(div, 2);
						var node_6 = $.child(div_2);

						$.component(node_6, () => Tabs.Content, ($$anchor, Tabs_Content) => {
							Tabs_Content($$anchor, {
								value: 'overview',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('View your dashboard metrics and key performance indicators.');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
							Tabs_Content_1($$anchor, {
								value: 'analytics',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Detailed analytics and insights about your data.');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
							Tabs_Content_2($$anchor, {
								value: 'reports',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Generate and view custom reports.');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_2);
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