import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Switch } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Switch_1($$anchor) {
	Switch($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Switch.HiddenInput, ($$anchor, Switch_HiddenInput) => {
				Switch_HiddenInput($$anchor, { 'data-testid': 'hidden-input' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Switch.Control, ($$anchor, Switch_Control) => {
				Switch_Control($$anchor, {
					'data-testid': 'control',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
							Switch_Thumb($$anchor, { 'data-testid': 'thumb' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_1, 2);

			$.component(node_3, () => Switch.Label, ($$anchor, Switch_Label) => {
				Switch_Label($$anchor, { 'data-testid': 'label' });
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}