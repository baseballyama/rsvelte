import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as UnderlineTabs from '$lib/components/ui/underline-tabs';
import { Window } from '$lib/components/ui/window';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex w-full max-w-full items-center justify-center p-6"><!></div>`);

export default function Underline_tabs_overflow($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Window(node, {
		class: 'max-w-lg',
		contentClass: 'px-0 py-1',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => UnderlineTabs.Root, ($$anchor, UnderlineTabs_Root) => {
				UnderlineTabs_Root($$anchor, {
					value: 'overview',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => UnderlineTabs.List, ($$anchor, UnderlineTabs_List) => {
							UnderlineTabs_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_3 = $.first_child(fragment_2);

									$.component(node_3, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger) => {
										UnderlineTabs_Trigger($$anchor, {
											value: 'overview',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Overview');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_1) => {
										UnderlineTabs_Trigger_1($$anchor, {
											value: 'deployments',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Deployments');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_2) => {
										UnderlineTabs_Trigger_2($$anchor, {
											value: 'analytics',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Analytics');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_3) => {
										UnderlineTabs_Trigger_3($$anchor, {
											value: 'speed-insights',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Speed Insights');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_4) => {
										UnderlineTabs_Trigger_4($$anchor, {
											value: 'logs',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Logs');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_5) => {
										UnderlineTabs_Trigger_5($$anchor, {
											value: 'observability',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Observability');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_6) => {
										UnderlineTabs_Trigger_6($$anchor, {
											value: 'firewall',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Firewall');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_7) => {
										UnderlineTabs_Trigger_7($$anchor, {
											value: 'ai-gateway',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('AI Gateway');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_8) => {
										UnderlineTabs_Trigger_8($$anchor, {
											value: 'storage',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('Storage');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									var node_12 = $.sibling(node_11, 2);

									$.component(node_12, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_9) => {
										UnderlineTabs_Trigger_9($$anchor, {
											value: 'flags',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Flags');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_10) => {
										UnderlineTabs_Trigger_10($$anchor, {
											value: 'settings',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Settings');

												$.append($$anchor, text_10);
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

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}