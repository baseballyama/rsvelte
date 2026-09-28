import * as $ from 'svelte/internal/server';
import { buttonVariants } from '$lib/components/ui/button';
import { confirmDelete, ConfirmDeleteDialog } from '$lib/components/ui/confirm-delete-dialog';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
import * as Avatar from '$lib/components/ui/avatar';
import { Badge } from '$lib/components/ui/badge';
import Github from '$lib/components/logos/github.svelte';
import { sleep } from '$lib/utils/sleep';

export default function Confirm_delete_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let projects = [
			{
				name: 'shadcn-svelte',
				url: 'https://shadcn-svelte.com',
				githubUrl: 'https://github.com/huntabyte/shadcn-svelte',
				faviconUrl: 'https://shadcn-svelte.com/favicon.ico'
			},

			{
				name: 'shadcn-svelte-extras',
				url: 'https://shadcn-svelte-extras.com',
				githubUrl: 'https://github.com/ieedan/shadcn-svelte-extras',
				faviconUrl: 'https://shadcn-svelte-extras.com/favicon.svg'
			},

			{
				name: 'jsrepo.dev',
				url: 'https://jsrepo.dev',
				githubUrl: 'https://github.com/jsrepojs/jsrepo',
				faviconUrl: 'https://jsrepo.com/favicon.png'
			},

			{
				name: 'jsrepo.com',
				url: 'https://jsrepo.com',
				githubUrl: 'https://github.com/jsrepojs/jsrepo.com',
				faviconUrl: 'https://jsrepo.com/favicon.png'
			}
		];

		ConfirmDeleteDialog($$renderer, {});
		$$renderer.push(`<!----> <div class="@container w-full p-6"><div class="grid w-full grid-cols-1 gap-2 @sm:grid-cols-2 @2xl:grid-cols-3"><!--[-->`);

		const each_array = $.ensure_array_like(projects);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let project = each_array[$$index];

			$$renderer.push(`<div class="hover:bg-accent/50 border-border relative flex w-full flex-col gap-2 rounded-md border p-4 transition-colors"><div class="flex items-center justify-between"><a href="#/" class="flex items-center gap-2">`);

			if (Avatar.Root) {
				$$renderer.push('<!--[-->');

				Avatar.Root($$renderer, {
					class: 'rounded-md',
					children: ($$renderer) => {
						if (Avatar.Image) {
							$$renderer.push('<!--[-->');
							Avatar.Image($$renderer, { src: project.faviconUrl });
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

			$$renderer.push(` <div class="flex flex-col"><span class="text-sm font-medium">${$.escape(project.name)}</span> <span class="text-muted-foreground text-xs">${$.escape(new URL(project.url).hostname)}</span></div></a> `);

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						if (DropdownMenu.Trigger) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Trigger($$renderer, {
								class: buttonVariants({ variant: 'ghost', size: 'icon' }),
								children: ($$renderer) => {
									EllipsisIcon($$renderer, { class: 'size-4' });
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (DropdownMenu.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Content($$renderer, {
								align: 'end',
								children: ($$renderer) => {
									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Add Favorite`);
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
												$$renderer.push(`<!---->View Logs`);
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
												$$renderer.push(`<!---->Archive`);
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
											onSelect: () => {
												confirmDelete({
													title: 'Delete repository',
													description: 'Are you sure you want to delete this repository?',
													onConfirm: async () => {
														await sleep(250);
														projects = projects.filter((p) => p.url !== project.url);
													}
												});
											},

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

			$$renderer.push(`</div> `);

			Badge($$renderer, {
				variant: 'secondary',
				class: 'w-fit',
				children: ($$renderer) => {
					Github($$renderer, { class: 'size-4' });
					$$renderer.push(`<!----> ${$.escape(project.githubUrl.slice(('https://github.com/').length))}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}