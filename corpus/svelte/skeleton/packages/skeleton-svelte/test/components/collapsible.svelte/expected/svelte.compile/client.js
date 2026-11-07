import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Collapsible } from '../../src/index.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Collapsible_1($$anchor) {
	Collapsible($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
				Collapsible_Trigger($$anchor, {
					'data-testid': 'trigger',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Collapsible.Indicator, ($$anchor, Collapsible_Indicator) => {
							Collapsible_Indicator($$anchor, { 'data-testid': 'indicator' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node, 2);

			$.component(node_2, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
				Collapsible_Content($$anchor, { 'data-testid': 'content' });
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}