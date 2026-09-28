import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

export default function Dropdown_08($$renderer) {
	DropdownMenu($$renderer, {
		children: ($$renderer) => {
			{
				function child($$renderer, { props }) {
					Button($$renderer, $.spread_props([
						{ variant: 'outline' },
						props,
						{
							children: ($$renderer) => {
								$$renderer.push(`<!---->Rich menu `);
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
									$$renderer.push(`<span>Edit</span> `);

									DropdownMenuShortcut($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->⌘E`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span>Duplicate</span> `);

									DropdownMenuShortcut($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->⌘D`);
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
									$$renderer.push(`<span>Archive</span> `);

									DropdownMenuShortcut($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->⌘A`);
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
										children: ($$renderer) => {
											$$renderer.push(`<!---->More`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownMenuSubContent($$renderer, {
										children: ($$renderer) => {
											DropdownMenuItem($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Move to project`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											DropdownMenuItem($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Move to folder`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);
											DropdownMenuSeparator($$renderer, {});
											$$renderer.push(`<!----> `);

											DropdownMenuItem($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Advanced options`);
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
									$$renderer.push(`<!---->Share`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							DropdownMenuItem($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Add to favorites`);
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
							$$renderer.push(`<span>Delete</span> `);

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