import * as $ from 'svelte/internal/server';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
import { cn } from '$lib/utils.js';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Minus from '@lucide/svelte/icons/minus';
import { commands } from '../../../commands/index.js';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';
import Tooltip from '../Tooltip.svelte';

export default function Lists($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const lists = commands['lists'];
		const editor = getEditor();
		const transaction = useEditorTransaction(editor);

		const isActive = () => {
			void transaction.version;

			return lists.some((h) => h.isActive?.(editor));
		};

		const ListIcon = () => {
			void transaction.version;

			const h = lists.find((h) => h.isActive?.(editor));

			return h ? h.icon : Minus;
		};

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					Tooltip($$renderer, {
						tooltip: 'Lists',
						children: ($$renderer) => {
							const Icon = ListIcon();

							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Trigger($$renderer, {
									class: buttonVariants({
										variant: 'ghost',
										size: 'icon',
										class: cn(isActive() && 'bg-muted')
									}),

									children: ($$renderer) => {
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
											$$renderer.push(`<!---->Lists`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <!--[-->`);

								const each_array = $.ensure_array_like(lists);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let list = each_array[$$index];
									const Icon = list.icon;

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => list.onClick?.(editor),
											children: ($$renderer) => {
												if (Icon) {
													$$renderer.push('<!--[-->');
													Icon($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` ${$.escape(list.tooltip)} `);

												if (DropdownMenu.Shortcut) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Shortcut($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(list.shortCut)}`);
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