import * as $ from 'svelte/internal/server';
import DotsVerticalIcon from "@tabler/icons-svelte/icons/dots-vertical";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Data_table_actions($$renderer) {
	if (DropdownMenu.Root) {
		$$renderer.push('<!--[-->');

		DropdownMenu.Root($$renderer, {
			children: ($$renderer) => {
				{
					function child($$renderer, { props }) {
						Button($$renderer, $.spread_props([
							{ variant: 'ghost', size: 'icon' },
							props,
							{
								children: ($$renderer) => {
									DotsVerticalIcon($$renderer, {});
									$$renderer.push(`<!----> <span class="sr-only">Open menu</span>`);
								},
								$$slots: { default: true }
							}
						]));
					}

					if (DropdownMenu.Trigger) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Trigger($$renderer, {
							class: 'flex size-8 text-muted-foreground data-[state=open]:bg-muted',
							child,
							$$slots: { child: true }
						});

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
						align: 'end',
						class: 'w-32',
						children: ($$renderer) => {
							if (DropdownMenu.Item) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Item($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Edit`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (DropdownMenu.Item) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Item($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Make a copy`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (DropdownMenu.Item) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Item($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Favorite`);
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

							if (DropdownMenu.Item) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Item($$renderer, {
									variant: 'destructive',
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
}