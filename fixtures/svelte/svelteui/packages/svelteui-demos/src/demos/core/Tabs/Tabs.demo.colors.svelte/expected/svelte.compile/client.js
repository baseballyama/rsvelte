import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs } from '@svelteuidev/core';

const code = `<script>
	import { Tabs } from '@svelteuidev/core';
<\/script>

<Tabs color='teal'>
    <Tabs.Tab label='Teal tab'>Teal tab content</Tabs.Tab>
    <Tabs.Tab label='Still teal tab'>Teal tab content #2</Tabs.Tab>
    <Tabs.Tab label='Pink tab' color='pink'>Pink tab content</Tabs.Tab>
</Tabs>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Tabs_demo_colors($$anchor) {
	Tabs($$anchor, {
		color: 'teal',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tabs.Tab, ($$anchor, Tabs_Tab) => {
				Tabs_Tab($$anchor, {
					label: 'Teal tab',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Teal tab content');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Tabs.Tab, ($$anchor, Tabs_Tab_1) => {
				Tabs_Tab_1($$anchor, {
					label: 'Still teal tab',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Teal tab content #2');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Tabs.Tab, ($$anchor, Tabs_Tab_2) => {
				Tabs_Tab_2($$anchor, {
					label: 'Pink tab',
					color: 'pink',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Pink tab content');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}