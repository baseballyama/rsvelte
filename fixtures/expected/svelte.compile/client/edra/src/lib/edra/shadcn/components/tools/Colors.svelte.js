import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { quickcolors } from '../../../utils.ts';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
import { cn } from '$lib/utils.js';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Check from '@lucide/svelte/icons/check';
import Tooltip from '../Tooltip.svelte';
import { getEditor, useEditorState } from '../../../tiptap/index.js';

var root = $.from_html(`<span>A</span> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2"><span class="w-4 text-center font-bold">A</span> <span class="capitalize"> </span></div> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex items-center gap-2"><span class="size-4 rounded-full border"></span> <span class="capitalize"> </span></div> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Colors($$anchor, $$props) {
	$.push($$props, true);

	const $editorState = () => $.store_get(editorState, '$editorState', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let open = $.state(false);
	const editor = getEditor();

	const editorState = useEditorState({
		editor,
		selector: ({ editor }) => ({
			currentColor: editor.getAttributes('textStyle').color,
			currentHighlight: editor.getAttributes('highlight').color
		})
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				Tooltip(node_1, {
					tooltip: 'Quick Colors',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => buttonVariants({ variant: 'ghost', size: 'icon', class: cn('gap-0.5') }));
							let $1 = $.derived(() => `color: ${$editorState().currentColor || ''}; background-color: ${$editorState().currentHighlight || ''};`);

							$.component(node_2, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, {
									get class() {
										return $.get($0);
									},

									get style() {
										return $.get($1);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.sibling($.first_child(fragment_3), 2);

										ChevronDown(node_3, { class: 'size-2! text-muted-foreground' });
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => ({ to: editor.view.dom.parentElement ?? undefined }));

					$.component(node_4, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
						DropdownMenu_Content($$anchor, {
							class: 'max-h-96 min-w-48 overflow-auto rounded-lg duration-300',
							get portalProps() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_4();
								var node_5 = $.first_child(fragment_4);

								$.component(node_5, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
									DropdownMenu_Group($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_2();
											var node_6 = $.first_child(fragment_5);

											$.component(node_6, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
												DropdownMenu_Label($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Text Colors');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											var node_7 = $.sibling(node_6, 2);

											$.each(node_7, 17, () => quickcolors, (color) => color.label, ($$anchor, color) => {
												const isActive = $.derived(() => $.get(color).value === ''
													? !$editorState().currentColor
													: $editorState().currentColor === $.get(color).value);

												var fragment_6 = $.comment();
												var node_8 = $.first_child(fragment_6);

												$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
													DropdownMenu_Item($$anchor, {
														get title() {
															return $.get(color).label;
														},
														class: 'flex cursor-pointer items-center justify-between',
														onclick: () => {
															if ($.get(color).value === '' || $.get(color).label === 'Default') {
																editor.chain().focus().unsetColor().run();
															} else {
																editor.chain().focus().setColor($.get(color).value).run();
															}
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_1();
															var div = $.first_child(fragment_7);
															var span = $.child(div);
															var span_1 = $.sibling(span, 2);
															var text_1 = $.only_child(span_1, true);

															$.reset(div);

															var node_9 = $.sibling(div, 2);

															{
																var consequent = ($$anchor) => {
																	Check($$anchor, { class: 'size-4 text-muted-foreground' });
																};

																$.if(node_9, ($$render) => {
																	if ($.get(isActive)) $$render(consequent);
																});
															}

															$.template_effect(() => {
																$.set_style(span, $.get(color).value ? `color: ${$.get(color).value};` : '');
																$.set_text(text_1, $.get(color).label);
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								var node_10 = $.sibling(node_5, 2);

								$.component(node_10, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
									DropdownMenu_Separator($$anchor, {});
								});

								var node_11 = $.sibling(node_10, 2);

								$.component(node_11, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
									DropdownMenu_Group_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root_2();
											var node_12 = $.first_child(fragment_9);

											$.component(node_12, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_1) => {
												DropdownMenu_Label_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Background Colors');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											var node_13 = $.sibling(node_12, 2);

											$.each(node_13, 17, () => quickcolors, (color) => color.label, ($$anchor, color) => {
												const isActive = $.derived(() => $.get(color).value === ''
													? !$editorState().currentHighlight
													: $editorState().currentHighlight === `${$.get(color).value}50`);

												var fragment_10 = $.comment();
												var node_14 = $.first_child(fragment_10);

												$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
													DropdownMenu_Item_1($$anchor, {
														get title() {
															return $.get(color).label;
														},
														class: 'flex cursor-pointer items-center justify-between',
														onclick: () => {
															if ($.get(color).value === '' || $.get(color).label === 'Default') {
																editor.chain().focus().unsetHighlight().run();
															} else {
																editor.chain().focus().setHighlight({ color: `${$.get(color).value}50` }).run();
															}
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root_3();
															var div_1 = $.first_child(fragment_11);
															var span_2 = $.child(div_1);
															var span_3 = $.sibling(span_2, 2);
															var text_3 = $.only_child(span_3, true);

															$.reset(div_1);

															var node_15 = $.sibling(div_1, 2);

															{
																var consequent_1 = ($$anchor) => {
																	Check($$anchor, { class: 'size-4 text-muted-foreground' });
																};

																$.if(node_15, ($$render) => {
																	if ($.get(isActive)) $$render(consequent_1);
																});
															}

															$.template_effect(() => {
																$.set_style(span_2, `background-color: ${$.get(color).value ? `${$.get(color).value}50` : 'transparent'};`);
																$.set_text(text_3, $.get(color).label);
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											});

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}