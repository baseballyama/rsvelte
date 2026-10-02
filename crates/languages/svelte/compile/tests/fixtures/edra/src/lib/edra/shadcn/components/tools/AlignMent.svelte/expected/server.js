import * as $ from 'svelte/internal/server';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
import { cn } from '$lib/utils.js';
import AlignLeft from '@lucide/svelte/icons/align-left';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Tooltip from '../Tooltip.svelte';
import { commands } from '../../../commands/index.js';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';

export default function AlignMent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					Tooltip($$renderer, {
						tooltip: 'Alignment',
						children: ($$renderer) => {
							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Trigger($$renderer, {
									class: buttonVariants({
										variant: 'ghost',
										size: 'icon',
										class: cn(isActive() && 'bg-muted')
									}),

									children: ($$renderer) => {
										const Icon = AlignmentIcon();

										if (Icon) {
											$$renderer.push('<!--[-->');
											Icon($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);
										ChevronDown($$renderer, { class: 'size-2! text-muted-foreground' });
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (DropdownMenu.Content) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Content($$renderer, {
							class: 'w-fit',
							portalProps: { to: editor.view.dom.parentElement ?? undefined },
							children: ($$renderer) => {
								if (DropdownMenu.Label) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Alignments`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <!--[-->`);

								const each_array = $.ensure_array_like(alignments);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let alignment = each_array[$$index];
									const Icon = alignment.icon;

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => alignment.onClick?.(editor),
											children: ($$renderer) => {
												if (Icon) {
													$$renderer.push('<!--[-->');
													Icon($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` ${$.escape(alignment.tooltip)} `);

												if (DropdownMenu.Shortcut) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Shortcut($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(alignment.shortCut)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}