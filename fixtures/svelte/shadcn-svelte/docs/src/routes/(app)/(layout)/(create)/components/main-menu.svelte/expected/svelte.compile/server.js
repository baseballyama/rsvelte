import * as $ from 'svelte/internal/server';
import { setMode, mode } from "mode-watcher";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { useIsMac } from "$lib/hooks/use-is-mac.svelte.js";
import { cn } from "$lib/utils.js";
import * as Picker from "./picker/index.js";
import { ActionMenuCtx } from "./action-menu-context.svelte.js";

export default function Main_menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className } = $$props;
		const isMac = useIsMac();
		const designSystem = useDesignSystem();
		const actionMenuCtx = ActionMenuCtx.get();

		function toggleTheme() {
			setMode(mode.current === "dark" ? "light" : "dark");
		}

		if (Picker.Root) {
			$$renderer.push('<!--[-->');

			Picker.Root($$renderer, {
				submenu: false,
				children: ($$renderer) => {
					if (Picker.Trigger) {
						$$renderer.push('<!--[-->');

						Picker.Trigger($$renderer, {
							submenu: false,
							class: cn("flex items-center justify-between gap-2 rounded-lg px-1.75 ring-1 ring-foreground/10 focus-visible:ring-1", className),
							children: ($$renderer) => {
								$$renderer.push(`<span class="font-medium">Menu</span> `);

								IconPlaceholder($$renderer, {
									lucide: 'MenuIcon',
									hugeicons: 'Menu09Icon',
									phosphor: 'ListIcon',
									tabler: 'IconMenu2',
									remixicon: 'RiMenuLine',
									class: 'size-5'
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Picker.Content) {
						$$renderer.push('<!--[-->');

						Picker.Content($$renderer, {
							side: 'right',
							align: 'start',
							alignOffset: -8,
							children: ($$renderer) => {
								if (Picker.Group) {
									$$renderer.push('<!--[-->');

									Picker.Group($$renderer, {
										children: ($$renderer) => {
											if (Picker.Item) {
												$$renderer.push('<!--[-->');

												Picker.Item($$renderer, {
													onSelect: () => actionMenuCtx.open = true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Navigate... `);

														if (Picker.Shortcut) {
															$$renderer.push('<!--[-->');

															Picker.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(isMac.current ? "⌘P" : "Ctrl+P")}`);
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

											$$renderer.push(` `);

											if (Picker.Item) {
												$$renderer.push('<!--[-->');

												Picker.Item($$renderer, {
													onSelect: () => designSystem.randomize(),
													children: ($$renderer) => {
														$$renderer.push(`<!---->Shuffle `);

														if (Picker.Shortcut) {
															$$renderer.push('<!--[-->');

															Picker.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->R`);
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

											$$renderer.push(` `);

											if (Picker.Item) {
												$$renderer.push('<!--[-->');

												Picker.Item($$renderer, {
													onSelect: toggleTheme,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Light/Dark `);

														if (Picker.Shortcut) {
															$$renderer.push('<!--[-->');

															Picker.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->D`);
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

								$$renderer.push(` `);

								if (Picker.Separator) {
									$$renderer.push('<!--[-->');
									Picker.Separator($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Picker.Group) {
									$$renderer.push('<!--[-->');

									Picker.Group($$renderer, {
										children: ($$renderer) => {
											if (Picker.Item) {
												$$renderer.push('<!--[-->');

												Picker.Item($$renderer, {
													onSelect: () => designSystem.undo(),
													disabled: !designSystem.canUndo,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Undo `);

														if (Picker.Shortcut) {
															$$renderer.push('<!--[-->');

															Picker.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(isMac.current ? "⌘Z" : "Ctrl+Z")}`);
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

											$$renderer.push(` `);

											if (Picker.Item) {
												$$renderer.push('<!--[-->');

												Picker.Item($$renderer, {
													onSelect: () => designSystem.redo(),
													disabled: !designSystem.canRedo,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Redo `);

														if (Picker.Shortcut) {
															$$renderer.push('<!--[-->');

															Picker.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(isMac.current ? "⇧⌘Z" : "Ctrl+Shift+Z")}`);
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

											$$renderer.push(` `);

											if (Picker.Separator) {
												$$renderer.push('<!--[-->');
												Picker.Separator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Picker.Item) {
												$$renderer.push('<!--[-->');

												Picker.Item($$renderer, {
													onSelect: () => designSystem.reset(),
													children: ($$renderer) => {
														$$renderer.push(`<!---->Reset `);

														if (Picker.Shortcut) {
															$$renderer.push('<!--[-->');

															Picker.Shortcut($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(isMac.current ? "⇧R" : "Shift+R")}`);
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