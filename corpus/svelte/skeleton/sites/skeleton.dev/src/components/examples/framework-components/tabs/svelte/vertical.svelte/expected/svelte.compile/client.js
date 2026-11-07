import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Vertical($$anchor) {
	Tabs($$anchor, {
		defaultValue: 'overview',
		orientation: 'vertical',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tabs.List, ($$anchor, Tabs_List) => {
				Tabs_List($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
							Tabs_Trigger($$anchor, {
								value: 'overview',
								class: 'justify-start',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Overview');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
							Tabs_Trigger_1($$anchor, {
								value: 'features',
								class: 'justify-start',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Key features');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
							Tabs_Trigger_2($$anchor, {
								value: 'activity',
								class: 'justify-start',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Activity');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Tabs.Indicator, ($$anchor, Tabs_Indicator) => {
							Tabs_Indicator($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node, 2);

			$.component(node_5, () => Tabs.Content, ($$anchor, Tabs_Content) => {
				Tabs_Content($$anchor, {
					value: 'overview',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('A concise overview of the project: usage, goals, and recent highlights. Use this area to orient readers with key metrics and links to\n		deeper docs.');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_5, 2);

			$.component(node_6, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
				Tabs_Content_1($$anchor, {
					value: 'features',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('List the most important features here with short, pragmatic descriptions so readers can scan for what matters (accessibility, theming,\n		integrations).');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			});

			var node_7 = $.sibling(node_6, 2);

			$.component(node_7, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
				Tabs_Content_2($$anchor, {
					value: 'activity',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Show recent activity or sample data: new releases, PRs merged, or notable user events. This helps examples feel realistic and\n		actionable.');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}