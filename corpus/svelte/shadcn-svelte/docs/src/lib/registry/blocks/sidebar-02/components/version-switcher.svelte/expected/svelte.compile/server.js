import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

export default function Version_switcher($$renderer, $$props) {
	let { versions, defaultVersion } = $$props;

	// svelte-ignore state_referenced_locally
	let selectedVersion = defaultVersion;

	if (Sidebar.Menu) {
		$$renderer.push('<!--[-->');

		Sidebar.Menu($$renderer, {
			children: ($$renderer) => {
				if (Sidebar.MenuItem) {
					$$renderer.push('<!--[-->');

					Sidebar.MenuItem($$renderer, {
						children: ($$renderer) => {
							if (DropdownMenu.Root) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Root($$renderer, {
									children: ($$renderer) => {
										{
											function child($$renderer, { props }) {
												if (Sidebar.MenuButton) {
													$$renderer.push('<!--[-->');

													Sidebar.MenuButton($$renderer, $.spread_props([
														{
															size: 'lg',
															class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
														},
														props,
														{
															children: ($$renderer) => {
																$$renderer.push(`<div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">`);
																GalleryVerticalEndIcon($$renderer, { class: 'size-4' });
																$$renderer.push(`<!----></div> <div class="flex flex-col gap-0.5 leading-none"><span class="font-medium">Documentation</span> <span>v${$.escape(selectedVersion)}</span></div> `);
																ChevronsUpDownIcon($$renderer, { class: 'ms-auto' });
																$$renderer.push(`<!---->`);
															},
															$$slots: { default: true }
														}
													]));

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											if (DropdownMenu.Trigger) {
												$$renderer.push('<!--[-->');
												DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										if (DropdownMenu.Content) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Content($$renderer, {
												class: 'w-(--bits-dropdown-menu-anchor-width)',
												align: 'start',
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like(versions);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let version = each_array[$$index];

														if (DropdownMenu.Item) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Item($$renderer, {
																onSelect: () => selectedVersion = version,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->v${$.escape(version)} `);

																	if (version === selectedVersion) {
																		$$renderer.push('<!--[0-->');
																		CheckIcon($$renderer, { class: 'ms-auto' });
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
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}