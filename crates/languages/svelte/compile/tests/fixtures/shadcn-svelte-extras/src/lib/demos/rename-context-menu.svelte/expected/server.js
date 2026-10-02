import * as $ from 'svelte/internal/server';
import * as Rename from '$lib/components/ui/rename';
import * as ContextMenu from '$lib/components/ui/context-menu';
import FileIcon from '@lucide/svelte/icons/file';
import * as Icons from '$lib/components/icons';
import { Kbd } from '$lib/components/ui/kbd';

export default function Rename_context_menu($$renderer) {
	let documents = [
		{ name: '+layout.svelte', mode: 'view' },
		{ name: '+page.svelte', mode: 'view' },
		{ name: '+page.server.ts', mode: 'view' }
	];

	function checkUnique(name, index) {
		return !documents.some((document, i) => i !== index && document.name === name);
	}

	function validateName(name, index) {
		if (name.trim() === '') return false;

		return checkUnique(name, index);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex flex-col gap-4"><p class="text-muted-foreground text-sm">Right click or press `);

		Kbd($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->F2`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> to rename files.</p> <div class="flex flex-col"><!--[-->`);

		const each_array = $.ensure_array_like(documents);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let document = each_array[index];

			if (Rename.Provider) {
				$$renderer.push('<!--[-->');

				Rename.Provider($$renderer, {
					children: ($$renderer) => {
						if (ContextMenu.Root) {
							$$renderer.push('<!--[-->');

							ContextMenu.Root($$renderer, {
								children: ($$renderer) => {
									if (ContextMenu.Trigger) {
										$$renderer.push('<!--[-->');

										ContextMenu.Trigger($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<button type="button" class="focus:bg-accent hover:bg-accent text-muted-foreground flex cursor-pointer items-center gap-2 px-2 text-start outline-none">`);

												if (document.name.endsWith('.css')) {
													$$renderer.push('<!--[0-->');

													if (Icons.CSS) {
														$$renderer.push('<!--[-->');
														Icons.CSS($$renderer, { class: 'size-4' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else if (document.name.endsWith('.svelte')) {
													$$renderer.push('<!--[1-->');

													if (Icons.Svelte) {
														$$renderer.push('<!--[-->');
														Icons.Svelte($$renderer, { class: 'size-4' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else if (document.name.endsWith('.ts')) {
													$$renderer.push('<!--[2-->');

													if (Icons.TypeScript) {
														$$renderer.push('<!--[-->');
														Icons.TypeScript($$renderer, { class: 'size-3' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');
													FileIcon($$renderer, { class: 'size-4' });
												}

												$$renderer.push(`<!--]--> `);

												if (Rename.Root) {
													$$renderer.push('<!--[-->');

													Rename.Root($$renderer, {
														this: 'span',
														blurBehavior: 'exit',
														class: 'text-foreground outline-ring flex h-7 w-[200px] !rounded-xs text-start focus:!ring-0 focus:outline-1 data-[mode=view]:place-items-center',
														validate: (name) => validateName(name, index),
														fallbackSelectionBehavior: 'all',
														get value() {
															return document.name;
														},

														set value($$value) {
															document.name = $$value;
															$$settled = false;
														},

														get mode() {
															return document.mode;
														},

														set mode($$value) {
															document.mode = $$value;
															$$settled = false;
														}
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(`</button>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (ContextMenu.Content) {
										$$renderer.push('<!--[-->');

										ContextMenu.Content($$renderer, {
											children: ($$renderer) => {
												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cut`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Copy`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (ContextMenu.Separator) {
													$$renderer.push('<!--[-->');
													ContextMenu.Separator($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												{
													function child($$renderer, { edit }) {
														if (ContextMenu.Item) {
															$$renderer.push('<!--[-->');

															ContextMenu.Item($$renderer, {
																onSelect: edit,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Rename... `);

																	if (ContextMenu.Shortcut) {
																		$$renderer.push('<!--[-->');

																		ContextMenu.Shortcut($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->F2`);
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

													if (Rename.Edit) {
														$$renderer.push('<!--[-->');
														Rename.Edit($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Delete`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}