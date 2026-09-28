import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Tooltip from '../Tooltip.svelte';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';

var root = $.from_html(`<span> </span> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function FontSize($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();
	const transaction = useEditorTransaction(editor);

	const currentSize = () => {
		void transaction.version;

		return editor.getAttributes('textStyle').fontSize || '';
	};

	const FONT_SIZE = [
		{ label: 'Tiny', value: '0.7rem' },
		{ label: 'Smaller', value: '0.75rem' },
		{ label: 'Small', value: '0.9rem' },
		{ label: 'Default', value: '' },
		{ label: 'Large', value: '1.25rem' },
		{ label: 'Extra Large', value: '1.5rem' }
	];

	const currentLabel = $.derived(() => {
		const l = FONT_SIZE.find((f) => f.value === currentSize());

		if (l) return l.label.split(' ')[0];

		return 'Medium';
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				Tooltip(node_1, {
					tooltip: 'Font Size',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => buttonVariants({ variant: 'ghost' }));

							$.component(node_2, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, {
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var span = $.first_child(fragment_3);
										var text = $.only_child(span, true);
										var node_3 = $.sibling(span, 2);

										ChevronDown(node_3, { class: 'size-2! text-muted-foreground' });
										$.template_effect(() => $.set_text(text, $.get(currentLabel)));
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
							class: 'w-fit',
							get portalProps() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_2();
								var node_5 = $.first_child(fragment_4);

								$.component(node_5, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
									DropdownMenu_Label($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Font Size');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								var node_6 = $.sibling(node_5, 2);

								$.each(node_6, 16, () => FONT_SIZE, (fontSize) => fontSize, ($$anchor, fontSize) => {
									var fragment_5 = $.comment();
									var node_7 = $.first_child(fragment_5);

									$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
										DropdownMenu_Item($$anchor, {
											onclick: () => {
												editor.chain().focus().setFontSize(fontSize.value).run();
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_6 = root_1();
												var text_2 = $.first_child(fragment_6);
												var node_8 = $.sibling(text_2);

												$.component(node_8, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut) => {
													DropdownMenu_Shortcut($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text();

															$.template_effect(() => $.set_text(text_3, fontSize.value));
															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												$.template_effect(() => $.set_text(text_2, `${fontSize.label ?? ''} `));
												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
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
}