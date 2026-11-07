import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Read_only($$anchor) {
	SegmentedControl($$anchor, {
		defaultValue: 'item-1',
		readOnly: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => SegmentedControl.Control, ($$anchor, SegmentedControl_Control) => {
				SegmentedControl_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => SegmentedControl.Indicator, ($$anchor, SegmentedControl_Indicator) => {
							SegmentedControl_Indicator($$anchor, {});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item) => {
							SegmentedControl_Item($$anchor, {
								value: 'item-1',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText) => {
										SegmentedControl_ItemText($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Item 1');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput) => {
										SegmentedControl_ItemHiddenInput($$anchor, {});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_2, 2);

						$.component(node_5, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_1) => {
							SegmentedControl_Item_1($$anchor, {
								value: 'item-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_6 = $.first_child(fragment_4);

									$.component(node_6, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_1) => {
										SegmentedControl_ItemText_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Item 2');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_1) => {
										SegmentedControl_ItemHiddenInput_1($$anchor, {});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_5, 2);

						$.component(node_8, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_2) => {
							SegmentedControl_Item_2($$anchor, {
								value: 'item-3',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_9 = $.first_child(fragment_5);

									$.component(node_9, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_2) => {
										SegmentedControl_ItemText_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Item 3');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_2) => {
										SegmentedControl_ItemHiddenInput_2($$anchor, {});
									});

									$.append($$anchor, fragment_5);
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