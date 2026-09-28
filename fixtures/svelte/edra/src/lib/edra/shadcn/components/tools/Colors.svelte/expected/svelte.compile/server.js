import * as $ from 'svelte/internal/server';
import { quickcolors } from '../../../utils.ts';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
import { cn } from '$lib/utils.js';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Check from '@lucide/svelte/icons/check';
import Tooltip from '../Tooltip.svelte';
import { getEditor, useEditorState } from '../../../tiptap/index.js';

export default function Colors($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let open = false;
		const editor = getEditor();

		const editorState = useEditorState({
			editor,
			selector: ({ editor }) => ({
				currentColor: editor.getAttributes('textStyle').color,
				currentHighlight: editor.getAttributes('highlight').color
			})
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Tooltip($$renderer, {
							tooltip: 'Quick Colors',
							children: ($$renderer) => {
								if (DropdownMenu.Trigger) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Trigger($$renderer, {
										class: buttonVariants({ variant: 'ghost', size: 'icon', class: cn('gap-0.5') }),
										style: `color: ${$.store_get($$store_subs ??= {}, '$editorState', editorState).currentColor || ''}; background-color: ${$.store_get($$store_subs ??= {}, '$editorState', editorState).currentHighlight || ''};`,
										children: ($$renderer) => {
											$$renderer.push(`<span>A</span> `);
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
								class: 'max-h-96 min-w-48 overflow-auto rounded-lg duration-300',
								portalProps: { to: editor.view.dom.parentElement ?? undefined },
								children: ($$renderer) => {
									if (DropdownMenu.Group) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (DropdownMenu.Label) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Label($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Text Colors`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` <!--[-->`);

												const each_array = $.ensure_array_like(quickcolors);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let color = each_array[$$index];

													const isActive = color.value === ''
														? !$.store_get($$store_subs ??= {}, '$editorState', editorState).currentColor
														: $.store_get($$store_subs ??= {}, '$editorState', editorState).currentColor === color.value;

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															title: color.label,
															class: 'flex cursor-pointer items-center justify-between',
															onclick: () => {
																if (color.value === '' || color.label === 'Default') {
																	editor.chain().focus().unsetColor().run();
																} else {
																	editor.chain().focus().setColor(color.value).run();
																}
															},

															children: ($$renderer) => {
																$$renderer.push(`<div class="flex items-center gap-2"><span class="w-4 text-center font-bold"${$.attr_style(color.value ? `color: ${color.value};` : '')}>A</span> <span class="capitalize">${$.escape(color.label)}</span></div> `);

																if (isActive) {
																	$$renderer.push('<!--[0-->');
																	Check($$renderer, { class: 'size-4 text-muted-foreground' });
																} else {
																	$$renderer.push('<!--[-1-->');
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

									$$renderer.push(` `);

									if (DropdownMenu.Separator) {
										$$renderer.push('<!--[-->');
										DropdownMenu.Separator($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (DropdownMenu.Group) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (DropdownMenu.Label) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Label($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Background Colors`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` <!--[-->`);

												const each_array_1 = $.ensure_array_like(quickcolors);

												for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
													let color = each_array_1[$$index_1];

													const isActive = color.value === ''
														? !$.store_get($$store_subs ??= {}, '$editorState', editorState).currentHighlight
														: $.store_get($$store_subs ??= {}, '$editorState', editorState).currentHighlight === `${color.value}50`;

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															title: color.label,
															class: 'flex cursor-pointer items-center justify-between',
															onclick: () => {
																if (color.value === '' || color.label === 'Default') {
																	editor.chain().focus().unsetHighlight().run();
																} else {
																	editor.chain().focus().setHighlight({ color: `${color.value}50` }).run();
																}
															},

															children: ($$renderer) => {
																$$renderer.push(`<div class="flex items-center gap-2"><span class="size-4 rounded-full border"${$.attr_style(`background-color: ${color.value ? `${color.value}50` : 'transparent'};`)}></span> <span class="capitalize">${$.escape(color.label)}</span></div> `);

																if (isActive) {
																	$$renderer.push('<!--[0-->');
																	Check($$renderer, { class: 'size-4 text-muted-foreground' });
																} else {
																	$$renderer.push('<!--[-1-->');
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}