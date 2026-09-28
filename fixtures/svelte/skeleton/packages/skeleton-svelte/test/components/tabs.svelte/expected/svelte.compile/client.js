import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs } from '../../src/index.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Tabs_1($$anchor) {
	Tabs($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tabs.List, ($$anchor, Tabs_List) => {
				Tabs_List($$anchor, {
					'data-testid': 'list',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
							Tabs_Trigger($$anchor, { value: 'tab', 'data-testid': 'trigger' });
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Tabs.Indicator, ($$anchor, Tabs_Indicator) => {
							Tabs_Indicator($$anchor, { 'data-testid': 'indicator' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node, 2);

			$.component(node_3, () => Tabs.Content, ($$anchor, Tabs_Content) => {
				Tabs_Content($$anchor, { value: 'tab', 'data-testid': 'content' });
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}