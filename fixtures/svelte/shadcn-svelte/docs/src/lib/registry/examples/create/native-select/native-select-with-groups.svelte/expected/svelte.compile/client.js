import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Native_select_with_groups($$anchor) {
	Example($$anchor, {
		title: 'With Groups',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
				NativeSelect_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
							NativeSelect_Option($$anchor, {
								value: '',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Select a food');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => NativeSelect.OptGroup, ($$anchor, NativeSelect_OptGroup) => {
							NativeSelect_OptGroup($$anchor, {
								label: 'Fruits',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
										NativeSelect_Option_1($$anchor, {
											value: 'apple',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Apple');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_2) => {
										NativeSelect_Option_2($$anchor, {
											value: 'banana',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Banana');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_3) => {
										NativeSelect_Option_3($$anchor, {
											value: 'blueberry',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Blueberry');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_2, 2);

						$.component(node_6, () => NativeSelect.OptGroup, ($$anchor, NativeSelect_OptGroup_1) => {
							NativeSelect_OptGroup_1($$anchor, {
								label: 'Vegetables',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_7 = $.first_child(fragment_4);

									$.component(node_7, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_4) => {
										NativeSelect_Option_4($$anchor, {
											value: 'carrot',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Carrot');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_5) => {
										NativeSelect_Option_5($$anchor, {
											value: 'broccoli',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Broccoli');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_6) => {
										NativeSelect_Option_6($$anchor, {
											value: 'spinach',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Spinach');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
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