import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ArchiveRestore from '@lucide/svelte/icons/archive-restore';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Plus from '@lucide/svelte/icons/plus';
import Share2 from '@lucide/svelte/icons/share-2';
import Trash from '@lucide/svelte/icons/trash';

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

export default function Dropdown_09($$renderer) {
	let framework = 'sveltekit';
	let emailNotifications = true;
	let pushNotifications = false;

	DropdownMenu($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ variant: 'outline' },
						props,
						{
							children: ($$renderer) => {
								$$renderer.push(`<!---->Rich menu with icons `);
								ChevronDown($$renderer, { class: '-me-1 opacity-60', size: 16, 'aria-hidden': 'true' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						}
					]));
				}

				DropdownMenuTrigger($$renderer, { child, $$slots: { child: true } });
			}

			$$renderer.push(`<!----> `);

			DropdownMenuContent($$renderer, {
				children: ($$renderer) => {
					DropdownMenuGroup($$renderer, {
						children: ($$renderer) => {
							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									Plus($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span>New</span> `);

									DropdownMenuShortcut($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->⌘N`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					DropdownMenuSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					DropdownMenuGroup($$renderer, {
						children: ($$renderer) => {
							DropdownMenuSub($$renderer, {
								children: ($$renderer) => {
									DropdownMenuSubTrigger($$renderer, {
										inset: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Framework`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownMenuSubContent($$renderer, {
										children: ($$renderer) => {
											DropdownMenuRadioGroup($$renderer, {
												value: framework,
												onValueChange: (value) => framework = value,
												children: ($$renderer) => {
													DropdownMenuRadioItem($$renderer, {
														value: 'sveltekit',
														children: ($$renderer) => {
															$$renderer.push(`<!---->SvelteKit`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													DropdownMenuRadioItem($$renderer, {
														value: 'nextjs',
														disabled: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Next.js`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													DropdownMenuRadioItem($$renderer, {
														value: 'remix',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Remix`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													DropdownMenuRadioItem($$renderer, {
														value: 'astro',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Astro`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuSub($$renderer, {
								children: ($$renderer) => {
									DropdownMenuSubTrigger($$renderer, {
										inset: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Notifications`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownMenuSubContent($$renderer, {
										children: ($$renderer) => {
											DropdownMenuCheckboxItem($$renderer, {
												checked: emailNotifications,
												onCheckedChange: (checked) => emailNotifications = checked,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Email`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											DropdownMenuCheckboxItem($$renderer, {
												checked: pushNotifications,
												onCheckedChange: (checked) => pushNotifications = checked,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Push`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					DropdownMenuSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					DropdownMenuGroup($$renderer, {
						children: ($$renderer) => {
							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									Share2($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span>Share</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									ArchiveRestore($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span>Archive</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					DropdownMenuSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					DropdownMenuItem($$renderer, {
						class: 'text-destructive focus:text-destructive',
						children: ($$renderer) => {
							Trash($$renderer, { size: 16, 'aria-hidden': 'true' });
							$$renderer.push(`<!----> <span>Delete</span> `);

							DropdownMenuShortcut($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->⌘⌫`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}