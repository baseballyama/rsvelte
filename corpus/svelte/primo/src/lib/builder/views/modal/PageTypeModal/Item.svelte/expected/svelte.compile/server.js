import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';
import { validate_url } from '$lib/builder/utilities';
import PageForm from './PageTypeForm.svelte';
import MenuPopup from '$lib/builder/ui/Dropdown.svelte';
import { PageTypes, Pages } from '$lib/pocketbase/collections';
import { self as pb, self } from '$lib/pocketbase/managers';
import { page } from '$app/state';
import * as AlertDialog from '$lib/components/ui/alert-dialog';
import { Loader } from 'lucide-svelte';
import { site_context } from '$lib/builder/stores/context';
import * as Avatar from '$lib/components/ui/avatar/index.js';
import { getUserActivity } from '$lib/UserActivity.svelte';

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { active, page_type } = $$props;
		const { value: site } = site_context.get();
		let editing_page_type = false;
		let is_delete_open = false;
		let deleting_page_type = false;

		async function delete_page_type() {
			deleting_page_type = true;

			try {
				if (!site) return;

				// Delete all pages belonging to this page type (no cascade on pages.page_type)
				const pages = await pb.instance?.collection('pages').getFullList({
					filter: `page_type = \"${page_type.id}\" && site = \"${site.id}\"`
				}) ?? [];

				for (const p of pages) {
					Pages.delete(p.id);
				}

				// Delete the page type (will cascade to related type records)
				PageTypes.delete(page_type.id);

				await self.commit();
				is_delete_open = false;
			} catch(error) {
				console.error('Error deleting page type:', error);
			} finally {
				deleting_page_type = false;
			}
		}

		let creating_page = false;
		let new_page_url = '';

		const full_url = $.derived(() => () => {
			const base_path = page.url.pathname.includes('/sites/') ? `/admin/sites/${site?.id}` : '/admin/site';

			return `${base_path}/page-type--${page_type.id}`;
		});

		const related_activities = $.derived(() => getUserActivity({
			filter: (activity) => activity.page_type?.id === page_type.id
		}));

		// Load pages that would be deleted when confirming
		const pages_to_delete = $.derived(() => is_delete_open && site
			? Pages.list({
				filter: { page_type: page_type.id, site: site.id },
				sort: 'index'
			}) ?? undefined
			: undefined);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (editing_page_type) {
				$$renderer.push('<!--[0-->');

				PageForm($$renderer, {
					new_page_name: page_type.name,
					new_color: page_type.color,
					new_icon: page_type.icon
				});
			} else {
				$$renderer.push(`<!--[-1--><div class="Item svelte-19dvrs8"><span class="icon svelte-19dvrs8"${$.attr_style('', { background: page_type.color })}>`);
				Icon($$renderer, { icon: page_type.icon });
				$$renderer.push(`<!----></span> <div${$.attr_class('page-item-container svelte-19dvrs8', void 0, { 'active': active })}><div class="left svelte-19dvrs8"><a class="name svelte-19dvrs8"${$.attr('href', full_url()())}>${$.escape(page_type.name)}</a> <div class="flex -space-x-4"><!--[-->`);

				const each_array = $.ensure_array_like(related_activities());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [{ user, user_avatar }] = each_array[$$index];

					if (Avatar.Root) {
						$$renderer.push('<!--[-->');

						Avatar.Root($$renderer, {
							class: 'ring-background ring-2 size-5 ml-4',
							children: ($$renderer) => {
								if (user_avatar) {
									$$renderer.push('<!--[0-->');

									if (Avatar.Image) {
										$$renderer.push('<!--[-->');

										Avatar.Image($$renderer, {
											src: user_avatar,
											alt: user.name || user.email,
											class: 'object-cover object-center'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (Avatar.Fallback) {
									$$renderer.push('<!--[-->');

									Avatar.Fallback($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape((user.name || user.email).slice(0, 2).toUpperCase())}`);
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

				$$renderer.push(`<!--]--></div></div> <div class="options svelte-19dvrs8">`);

				MenuPopup($$renderer, {
					icon: 'carbon:overflow-menu-vertical',
					options: [
						{
							label: 'Edit Page Type',
							icon: 'clarity:edit-solid',
							on_click: () => {
								editing_page_type = !editing_page_type;
							}
						},

						...page_type.name !== 'Default'
							? [
								{
									label: 'Delete Type & Pages',
									icon: 'fluent:delete-20-filled',
									on_click: () => {
										is_delete_open = true;
									}
								}
							]
							: []
					]
				});

				$$renderer.push(`<!----></div></div></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					get open() {
						return is_delete_open;
					},

					set open($$value) {
						is_delete_open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								class: 'z-[1001]',
								children: ($$renderer) => {
									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Delete page type?`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Description) {
													$$renderer.push('<!--[-->');

													AlertDialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->This action permanently deletes <strong>${$.escape(page_type.name)}</strong> and all its pages.`);
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

									$$renderer.push(` <div class="mt-2 space-y-2"><div class="text-sm text-muted-foreground">Pages to be deleted (${$.escape(pages_to_delete() ? pages_to_delete().length : '…')}):</div> `);

									if (pages_to_delete() === undefined) {
										$$renderer.push(`<!--[0--><div class="flex items-center gap-2 text-sm text-muted-foreground">`);
										Loader($$renderer, { class: 'animate-spin h-4 w-4' });
										$$renderer.push(`<!----> Loading pages…</div>`);
									} else if (pages_to_delete().length === 0) {
										$$renderer.push(`<!--[1--><div class="text-sm text-muted-foreground">No pages use this type.</div>`);
									} else {
										$$renderer.push(`<!--[-1--><div class="max-h-56 overflow-auto rounded border border-border/50"><ul class="divide-y divide-border/50 text-sm"><!--[-->`);

										const each_array_1 = $.ensure_array_like(pages_to_delete());

										for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
											let p = each_array_1[$$index_1];

											$$renderer.push(`<li class="px-3 py-2 flex items-center justify-between gap-2"><span class="truncate">${$.escape(p.name)}</span> `);

											if (p.slug) {
												$$renderer.push(`<!--[0--><code class="text-xs text-muted-foreground">/${$.escape(p.slug)}</code>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></li>`);
										}

										$$renderer.push(`<!--]--></ul></div>`);
									}

									$$renderer.push(`<!--]--></div> `);

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Action) {
													$$renderer.push('<!--[-->');

													AlertDialog.Action($$renderer, {
														onclick: delete_page_type,
														class: 'bg-red-600 hover:bg-red-700',
														children: ($$renderer) => {
															if (deleting_page_type) {
																$$renderer.push(`<!--[0--><div class="animate-spin absolute">`);
																Loader($$renderer, {});
																$$renderer.push(`<!----></div>`);
															} else {
																$$renderer.push(`<!--[-1-->Delete ${$.escape(page_type.name)}`);
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

			$$renderer.push(` `);

			if (creating_page) {
				$$renderer.push(`<!--[0--><div style="border-left: 0.5rem solid #111;">`);
				PageForm($$renderer, {});
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}