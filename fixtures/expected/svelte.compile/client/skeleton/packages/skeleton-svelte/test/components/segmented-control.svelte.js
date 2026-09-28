import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SegmentedControl } from '../../src/index.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Segmented_control($$anchor) {
	SegmentedControl($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => SegmentedControl.Label, ($$anchor, SegmentedControl_Label) => {
				SegmentedControl_Label($$anchor, { 'data-testid': 'label' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => SegmentedControl.Control, ($$anchor, SegmentedControl_Control) => {
				SegmentedControl_Control($$anchor, {
					'data-testid': 'control',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => SegmentedControl.Indicator, ($$anchor, SegmentedControl_Indicator) => {
							SegmentedControl_Indicator($$anchor, { 'data-testid': 'indicator' });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item) => {
							SegmentedControl_Item($$anchor, {
								value: 'item-1',
								'data-testid': 'item',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText) => {
										SegmentedControl_ItemText($$anchor, { 'data-testid': 'item-text' });
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput) => {
										SegmentedControl_ItemHiddenInput($$anchor, { 'data-testid': 'item-hidden-input' });
									});

									$.append($$anchor, fragment_3);
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
}