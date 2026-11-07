import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { buttonVariants } from '$lib/components/ui/button';
import { confirmDelete, ConfirmDeleteDialog } from '$lib/components/ui/confirm-delete-dialog';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
import * as Avatar from '$lib/components/ui/avatar';
import { Badge } from '$lib/components/ui/badge';
import Github from '$lib/components/logos/github.svelte';
import { sleep } from '$lib/utils/sleep';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> `, 1);
var root_3 = $.from_html(`<div class="hover:bg-accent/50 border-border relative flex w-full flex-col gap-2 rounded-md border p-4 transition-colors"><div class="flex items-center justify-between"><a href="#/" class="flex items-center gap-2"><!> <div class="flex flex-col"><span class="text-sm font-medium"> </span> <span class="text-muted-foreground text-xs"> </span></div></a> <!></div> <!></div>`);
var root_4 = $.from_html(`<!> <div class="@container w-full p-6"><div class="grid w-full grid-cols-1 gap-2 @sm:grid-cols-2 @2xl:grid-cols-3"></div></div>`, 1);

export default function Confirm_delete_dialog($$anchor, $$props) {
	$.push($$props, true);

	let projects = $.state($.proxy([
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
	]));

	var fragment = root_4();
	var node = $.first_child(fragment);

	ConfirmDeleteDialog(node, {});

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);

	$.each(div_1, 21, () => $.get(projects), (project) => project.url, ($$anchor, project) => {
		var div_2 = root_3();
		var div_3 = $.child(div_2);
		var a = $.child(div_3);
		var node_1 = $.child(a);

		$.component(node_1, () => Avatar.Root, ($$anchor, Avatar_Root) => {
			Avatar_Root($$anchor, {
				class: 'rounded-md',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => Avatar.Image, ($$anchor, Avatar_Image) => {
						Avatar_Image($$anchor, {
							get src() {
								return $.get(project).faviconUrl;
							}
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});

		var div_4 = $.sibling(node_1, 2);
		var span = $.child(div_4);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(div_4);
		$.reset(a);

		var node_3 = $.sibling(a, 2);

		$.component(node_3, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
			DropdownMenu_Root($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_4 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => buttonVariants({ variant: 'ghost', size: 'icon' }));

						$.component(node_4, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
							DropdownMenu_Trigger($$anchor, {
								get class() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									EllipsisIcon($$anchor, { class: 'size-4' });
								},
								$$slots: { default: true }
							});
						});
					}

					var node_5 = $.sibling(node_4, 2);

					$.component(node_5, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
						DropdownMenu_Content($$anchor, {
							align: 'end',
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_6 = $.first_child(fragment_4);

								$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
									DropdownMenu_Item($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Add Favorite');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								var node_7 = $.sibling(node_6, 2);

								$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
									DropdownMenu_Item_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('View Logs');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								});

								var node_8 = $.sibling(node_7, 2);

								$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
									DropdownMenu_Item_2($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Archive');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});
								});

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
									DropdownMenu_Separator($$anchor, {});
								});

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
									DropdownMenu_Item_3($$anchor, {
										variant: 'destructive',
										onSelect: () => {
											confirmDelete({
												title: 'Delete repository',
												description: 'Are you sure you want to delete this repository?',
												onConfirm: async () => {
													await sleep(250);
													$.set(projects, $.get(projects).filter((p) => p.url !== $.get(project).url), true);
												}
											});
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Delete');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		});

		$.reset(div_3);

		var node_11 = $.sibling(div_3, 2);

		Badge(node_11, {
			variant: 'secondary',
			class: 'w-fit',
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_2();
				var node_12 = $.first_child(fragment_5);

				Github(node_12, { class: 'size-4' });

				var text_6 = $.sibling(node_12);

				$.template_effect(($0) => $.set_text(text_6, ` ${$0 ?? ''}`), [
					() => $.get(project).githubUrl.slice(('https://github.com/').length)
				]);

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});

		$.reset(div_2);

		$.template_effect(() => {
			$.set_text(text, $.get(project).name);
			$.set_text(text_1, new URL($.get(project).url).hostname);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}