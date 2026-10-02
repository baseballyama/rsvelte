import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TagsInput, useTagsInput } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="w-full space-y-4"><!> <div class="card preset-outlined-surface-200-800 flex justify-center items-center py-4"><button class="btn preset-filled">Clear Tags</button></div></div>`);

export default function Provider($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const tagsInput = useTagsInput({ id, defaultValue: ['Vanilla', 'Chocolate', 'Strawberry'] });
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => TagsInput.Provider, ($$anchor, TagsInput_Provider) => {
		TagsInput_Provider($$anchor, {
			get value() {
				return tagsInput;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => TagsInput.Control, ($$anchor, TagsInput_Control) => {
					TagsInput_Control($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							{
								const children = ($$anchor, tagsInput = $.noop) => {
									var fragment_2 = $.comment();
									var node_3 = $.first_child(fragment_2);

									$.each(node_3, 17, () => tagsInput()().value, $.index, ($$anchor, value, index) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => TagsInput.Item, ($$anchor, TagsInput_Item) => {
											TagsInput_Item($$anchor, {
												get value() {
													return $.get(value);
												},
												index,
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => TagsInput.ItemPreview, ($$anchor, TagsInput_ItemPreview) => {
														TagsInput_ItemPreview($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root();
																var node_6 = $.first_child(fragment_5);

																$.component(node_6, () => TagsInput.ItemText, ($$anchor, TagsInput_ItemText) => {
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

																var node_7 = $.sibling(node_6, 2);

																$.component(node_7, () => TagsInput.ItemDeleteTrigger, ($$anchor, TagsInput_ItemDeleteTrigger) => {
																	TagsInput_ItemDeleteTrigger($$anchor, {});
																});

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_5, 2);

													$.component(node_8, () => TagsInput.ItemInput, ($$anchor, TagsInput_ItemInput) => {
														TagsInput_ItemInput($$anchor, {});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									});

									$.append($$anchor, fragment_2);
								};

								$.component(node_2, () => TagsInput.Context, ($$anchor, TagsInput_Context) => {
									TagsInput_Context($$anchor, { children, $$slots: { default: true } });
								});
							}

							var node_9 = $.sibling(node_2, 2);

							$.component(node_9, () => TagsInput.Input, ($$anchor, TagsInput_Input) => {
								TagsInput_Input($$anchor, { placeholder: 'Add a flavor...' });
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_1, 2);

				$.component(node_10, () => TagsInput.HiddenInput, ($$anchor, TagsInput_HiddenInput) => {
					TagsInput_HiddenInput($$anchor, {});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var div_1 = $.sibling(node, 2);
	var button = $.only_child(div_1);

	$.reset(div);
	$.delegated('click', button, () => tagsInput().clearValue());
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);