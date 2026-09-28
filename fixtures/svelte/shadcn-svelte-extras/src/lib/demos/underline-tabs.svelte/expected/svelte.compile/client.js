import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as UnderlineTabs from '$lib/components/ui/underline-tabs';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="relative w-full max-w-[458px]"><!></div>`);

export default function Underline_tabs($$anchor) {
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => UnderlineTabs.Root, ($$anchor, UnderlineTabs_Root) => {
		UnderlineTabs_Root($$anchor, {
			value: 'overview',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => UnderlineTabs.List, ($$anchor, UnderlineTabs_List) => {
					UnderlineTabs_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger) => {
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

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_1) => {
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

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_2) => {
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

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_3) => {
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

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_4) => {
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

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}