import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col items-center gap-4"><!> <p><span class="opacity-60">You selected</span> <code class="code"> </code></p></div>`);

export default function Default($$anchor) {
	let value = $.state('music');
	var div = root_2();
	var node = $.child(div);

	SegmentedControl(node, {
		get value() {
			return $.get(value);
		},
		onValueChange: (details) => $.set(value, details.value, true),
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => SegmentedControl.Label, ($$anchor, SegmentedControl_Label) => {
				SegmentedControl_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Browse');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => SegmentedControl.Control, ($$anchor, SegmentedControl_Control) => {
				SegmentedControl_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => SegmentedControl.Indicator, ($$anchor, SegmentedControl_Indicator) => {
							SegmentedControl_Indicator($$anchor, {});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item) => {
							SegmentedControl_Item($$anchor, {
								value: 'music',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_5 = $.first_child(fragment_2);

									$.component(node_5, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText) => {
										SegmentedControl_ItemText($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Music');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput) => {
										SegmentedControl_ItemHiddenInput($$anchor, {});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_4, 2);

						$.component(node_7, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_1) => {
							SegmentedControl_Item_1($$anchor, {
								value: 'images',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_8 = $.first_child(fragment_3);

									$.component(node_8, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_1) => {
										SegmentedControl_ItemText_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Images');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_1) => {
										SegmentedControl_ItemHiddenInput_1($$anchor, {});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_10 = $.sibling(node_7, 2);

						$.component(node_10, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_2) => {
							SegmentedControl_Item_2($$anchor, {
								value: 'videos',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_11 = $.first_child(fragment_4);

									$.component(node_11, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_2) => {
										SegmentedControl_ItemText_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Videos');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_12 = $.sibling(node_11, 2);

									$.component(node_12, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_2) => {
										SegmentedControl_ItemHiddenInput_2($$anchor, {});
									});

									$.append($$anchor, fragment_4);
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

	var p = $.sibling(node, 2);
	var code = $.sibling($.child(p), 2);
	var text_4 = $.only_child(code, true);

	$.reset(p);
	$.reset(div);
	$.template_effect(() => $.set_text(text_4, $.get(value)));
	$.append($$anchor, div);
}