import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tab from "carbon-components-svelte/Tabs/Tab.svelte";
import TabContent from "carbon-components-svelte/Tabs/TabContent.svelte";
import Tabs from "carbon-components-svelte/Tabs/Tabs.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function TabSecondaryLabel_test($$anchor) {
	Tabs($$anchor, {
		type: 'container',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Tab(node, { label: 'Engage', secondaryLabel: '(21/25)' });

			var node_1 = $.sibling(node, 2);

			Tab(node_1, {
				label: 'Analyze',
				$$slots: {
					secondaryChildren: ($$anchor, $$slotProps) => {
						var text = $.text('(12/16)');

						$.append($$anchor, text);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Tab(node_2, { label: 'Plain' });
			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			content: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_3 = $.first_child(fragment_2);

				TabContent(node_3, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Engage content');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				TabContent(node_4, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Analyze content');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				TabContent(node_5, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Plain content');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			}
		}
	});
}