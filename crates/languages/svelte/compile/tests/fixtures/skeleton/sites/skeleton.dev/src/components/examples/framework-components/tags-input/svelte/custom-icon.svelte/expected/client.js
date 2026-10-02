import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleXIcon from '@lucide/svelte/icons/circle-x';
import { TagsInput } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Custom_icon($$anchor, $$props) {
	$.push($$props, true);

	TagsInput($$anchor, {
		defaultValue: ['Vanilla', 'Chocolate', 'Strawberry'],
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => TagsInput.Control, ($$anchor, TagsInput_Control) => {
				TagsInput_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							const children = ($$anchor, tagsInput = $.noop) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.each(node_2, 17, () => tagsInput()().value, $.index, ($$anchor, value, index) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => TagsInput.Item, ($$anchor, TagsInput_Item) => {
										TagsInput_Item($$anchor, {
											get value() {
												return $.get(value);
											},
											index,
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => TagsInput.ItemPreview, ($$anchor, TagsInput_ItemPreview) => {
													TagsInput_ItemPreview($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root();
															var node_5 = $.first_child(fragment_6);

															$.component(node_5, () => TagsInput.ItemText, ($$anchor, TagsInput_ItemText) => {
																TagsInput_ItemText($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text();

																		$.template_effect(() => $.set_text(text, $.get(value)));
																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => TagsInput.ItemDeleteTrigger, ($$anchor, TagsInput_ItemDeleteTrigger) => {
																TagsInput_ItemDeleteTrigger($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		CircleXIcon($$anchor, { class: 'size-4' });
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_4, 2);

												$.component(node_7, () => TagsInput.ItemInput, ($$anchor, TagsInput_ItemInput) => {
													TagsInput_ItemInput($$anchor, {});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								});

								$.append($$anchor, fragment_3);
							};

							$.component(node_1, () => TagsInput.Context, ($$anchor, TagsInput_Context) => {
								TagsInput_Context($$anchor, { children, $$slots: { default: true } });
							});
						}

						var node_8 = $.sibling(node_1, 2);

						$.component(node_8, () => TagsInput.Input, ($$anchor, TagsInput_Input) => {
							TagsInput_Input($$anchor, { placeholder: 'Add a flavor...' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_9 = $.sibling(node, 2);

			$.component(node_9, () => TagsInput.HiddenInput, ($$anchor, TagsInput_HiddenInput) => {
				TagsInput_HiddenInput($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}