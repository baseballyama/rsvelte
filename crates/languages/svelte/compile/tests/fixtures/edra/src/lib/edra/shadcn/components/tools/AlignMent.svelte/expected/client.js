import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
import { cn } from '$lib/utils.js';
import AlignLeft from '@lucide/svelte/icons/align-left';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Tooltip from '../Tooltip.svelte';
import { commands } from '../../../commands/index.js';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';

var root = $.from_html(`<!> <!>`, 1);

export default function AlignMent($$anchor, $$props) {
	$.push($$props, true);

	const alignments = commands['alignment'];
	const editor = getEditor();
	const transaction = useEditorTransaction(editor);

	const isActive = () => {
		void transaction.version;

		return alignments.find((h) => h.isActive?.(editor)) !== undefined;
	};

	const AlignmentIcon = () => {
		void transaction.version;

		const h = alignments.find((h) => h.isActive?.(editor));

		return h ? h.icon : AlignLeft;
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				Tooltip(node_1, {
					tooltip: 'Alignment',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => buttonVariants({
								variant: 'ghost',
								size: 'icon',
								class: cn(isActive() && 'bg-muted')
							}));

							$.component(node_2, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, {
									get class() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										const Icon = $.derived(AlignmentIcon);
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => $.get(Icon), ($$anchor, Icon_1) => {
											Icon_1($$anchor, {});
										});

										var node_4 = $.sibling(node_3, 2);

										ChevronDown(node_4, { class: 'size-2! text-muted-foreground' });
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

				var node_5 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => ({ to: editor.view.dom.parentElement ?? undefined }));

					$.component(node_5, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
						DropdownMenu_Content($$anchor, {
							class: 'w-fit',
							get portalProps() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_6 = $.first_child(fragment_4);

								$.component(node_6, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
									DropdownMenu_Label($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Alignments');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								var node_7 = $.sibling(node_6, 2);

								$.each(node_7, 16, () => alignments, (alignment) => alignment, ($$anchor, alignment) => {
									const Icon = $.derived(() => alignment.icon);
									var fragment_5 = $.comment();
									var node_8 = $.first_child(fragment_5);

									$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
										DropdownMenu_Item($$anchor, {
											onclick: () => alignment.onClick?.(editor),
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_9 = $.first_child(fragment_6);

												$.component(node_9, () => $.get(Icon), ($$anchor, Icon_2) => {
													Icon_2($$anchor, {});
												});

												var text_1 = $.sibling(node_9);
												var node_10 = $.sibling(text_1);

												$.component(node_10, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut) => {
													DropdownMenu_Shortcut($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text();

															$.template_effect(() => $.set_text(text_2, alignment.shortCut));
															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.template_effect(() => $.set_text(text_1, ` ${alignment.tooltip ?? ''} `));
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