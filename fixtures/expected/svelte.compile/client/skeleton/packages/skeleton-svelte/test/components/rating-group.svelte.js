import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RatingGroup } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Rating_group($$anchor) {
	RatingGroup($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => RatingGroup.Label, ($$anchor, RatingGroup_Label) => {
				RatingGroup_Label($$anchor, {
					'data-testid': 'label',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Label');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => RatingGroup.Control, ($$anchor, RatingGroup_Control) => {
				RatingGroup_Control($$anchor, {
					'data-testid': 'control',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => RatingGroup.Item, ($$anchor, RatingGroup_Item) => {
							RatingGroup_Item($$anchor, { index: 1, 'data-testid': 'item' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_1, 2);

			$.component(node_3, () => RatingGroup.HiddenInput, ($$anchor, RatingGroup_HiddenInput) => {
				RatingGroup_HiddenInput($$anchor, { 'data-testid': 'hidden-input' });
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}