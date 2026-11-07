import * as $ from 'svelte/internal/server';
import Item from './Item.svelte';
import Icon from '@iconify/svelte';
import { onMount, tick } from 'svelte';
import { get, set } from 'idb-keyval';
import { slide, fade } from 'svelte/transition';
import { flip } from 'svelte/animate';
import { content_editable, validate_url } from '$lib/builder/utilities';
import PageForm from './PageForm.svelte';
import MenuPopup from '$lib/builder/ui/Dropdown.svelte';
import * as Dialog from '$lib/components/ui/dialog';
import { Button } from '$lib/components/ui/button';
import { page as pageState } from '$app/state';
import { toast } from 'svelte-sonner';
import { Pages, PageTypes, Sites } from '$lib/pocketbase/collections';
import { site_context } from '$lib/builder/stores/context';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { build_cms_page_url } from '$lib/pages';
import { goto } from '$app/navigation';
import * as Avatar from '$lib/components/ui/avatar/index.js';
import { self as selfManager } from '$lib/pocketbase/managers';
import { getUserActivity } from '$lib/UserActivity.svelte';

export default function Item_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let editing_page = false;

		/** @type {Props} */
		let {
			parent,
			page,
			oncreate,
			page_slug,
			active_page_id,
			hover_position = null
		} = $$props;

		// Get site from context (preferred) or fallback to hostname lookup
		const { value: site } = site_context.get();

		const homepage = $.derived(() => site.homepage());
		const full_url = $.derived(() => build_cms_page_url(page, pageState.url));
		const allPages = $.derived(() => site?.pages() ?? []);
		const page_type = $.derived(() => PageTypes.one(page.page_type));
		const related_activities = $.derived(() => getUserActivity({ filter: (activity) => activity.page?.id === page.id }));
		let showing_children = false;
		let children = $.derived(() => (page.children() ?? []).sort((a, b) => b.index - a.index));
		let has_children = $.derived(() => children().length > 0 && page.slug !== '');
		let has_toggled = false;
		const active = $.derived(() => page.id === active_page_id);

		// Local hover_position for this level's children (separate from parent's hover_position)
		// This is used to track hover position for subpages when this Item has children
		let children_hover_position = null;

		get(`page-list-toggle--${page.id}`).then((toggled) => {
			if (toggled !== undefined) showing_children = toggled;
		});

		let creating_page = false;
		let delete_warning_dialog = false;
		let pages_to_delete = [];
		let pending_delete = null;

		// Function to get all descendants (children, grandchildren, etc.) of a page
		function getAllDescendants(pageId) {
			const descendants = [];
			const queue = [pageId];

			while (queue.length > 0) {
				const currentId = queue.shift();
				const children = allPages().filter((p) => p.parent === currentId);

				for (const child of children) {
					descendants.push(child);
					queue.push(child.id);
				}
			}

			return descendants;
		}

		let drag_handle_element = void 0;
		let element = void 0;

		onMount(async () => {
			draggable({
				element,
				dragHandle: drag_handle_element,
				getInitialData: () => ({ page }),
				onDragStart: () => {
					is_dragging = true;
				},

				onDrop: () => {
					is_dragging = false;
				}
			});

			dropTargetForElements({
				element,
				getData({ input, element }) {
					return attachClosestEdge({ page }, { element, input, allowedEdges: ['top', 'bottom'] });
				},

				onDrag({ self, source }) {
					// Only show indicators if dragging within the same parent level
					const page_being_dragged = source.data.page;

					const same_parent = page.parent === page_being_dragged.parent;

					if (!same_parent) {
						hover_position = null;

						return;
					}

					// Dragging - adjust indicator according to drag position
					const edge = extractClosestEdge(self.data);

					if (edge === 'bottom') {
						// Set hover position to show indicator below this item
						// For subpages, hover_position prop is passed from parent's children_hover_position
						// Since hover_position is $bindable, setting it updates the parent's value
						hover_position = `${page.id}-bottom`;
					} else if (edge === 'top') {
						// For top edge, we want to show the indicator above this item
						// which is the bottom of the previous item
						if (page.index === 0 && page.parent === '') {
							hover_position = null; // Can't drop above home page
						} else if (page.index === 0 && page.parent) {
							// First child in a nested level - show at top of children list
							hover_position = `${page.parent}-children-top`;
						} else {
							// Find the previous sibling
							const siblings = allPages().filter((p) => p.parent === page.parent).sort((a, b) => a.index - b.index);

							const prevIndex = siblings.findIndex((p) => p.id === page.id) - 1;

							if (prevIndex >= 0) {
								hover_position = `${siblings[prevIndex].id}-bottom`;
							}
						}
					}
				},

				onDragLeave() {
					hover_position = null;
				},

				onDrop({ self, source }) {
					// Dropped - adjust index of moved page and siblings pages
					const page_dragged_over = self.data.page;

					const page_being_dragged = source.data.page;
					const closestEdgeOfTarget = extractClosestEdge(self.data);

					// Don't allow dragging onto itself
					if (page_dragged_over.id === page_being_dragged.id) {
						hover_position = null;

						return;
					}

					// Don't allow placing above home page
					if (closestEdgeOfTarget === 'top' && page_dragged_over.index === 0 && page_dragged_over.parent === '') {
						hover_position = null;

						return;
					}

					// Check if dragging between different parent levels
					const same_parent = page_dragged_over.parent === page_being_dragged.parent;

					// Get all siblings (pages with same parent as the target)
					const siblings = allPages().filter((p) => p.parent === page_dragged_over.parent).sort((a, b) => a.index - b.index);

					const old_index = page_being_dragged.index;
					let target_index;

					if (closestEdgeOfTarget === 'top') {
						target_index = page_dragged_over.index;
					} else if (closestEdgeOfTarget === 'bottom') {
						target_index = page_dragged_over.index + 1;
					}

					hover_position = null;

					// Only allow reordering within same parent
					if (same_parent) {
						// Delay the actual updates to prevent jerky animations
						requestAnimationFrame(() => {
							// Adjust target index if we're moving from before to after in the list
							let final_index = target_index;

							if (old_index < target_index) {
								final_index = target_index - 1;
							}

							// Don't do anything if position hasn't changed
							if (old_index === final_index) {
								return;
							}

							// Reindex all affected siblings
							for (let i = 0; i < siblings.length; i++) {
								const sibling = siblings[i];
								let new_index = sibling.index;

								if (sibling.id === page_being_dragged.id) {
									new_index = final_index;
								} else if (old_index < final_index) {
									// Moving item down - shift others up
									if (sibling.index > old_index && sibling.index <= final_index) {
										new_index = sibling.index - 1;
									}
								} else {
									// Moving item up - shift others down
									if (sibling.index >= final_index && sibling.index < old_index) {
										new_index = sibling.index + 1;
									}
								}

								if (new_index !== sibling.index) {
									Pages.update(sibling.id, { index: new_index });
								}
							}

							selfManager.commit();
						});
					}
				}
			});
		});

		let is_dragging = false;
		let name_input_el;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class('Item svelte-1pa9dkf', void 0, { 'contains-child': parent, 'dragging': is_dragging })}><div${$.attr_class('page-item-container svelte-1pa9dkf', void 0, {
				'active': active(),
				'expanded': showing_children && has_children()
			})}><div class="left svelte-1pa9dkf">`);

			if (editing_page) {
				$$renderer.push(`<!--[0--><div class="details svelte-1pa9dkf"><div class="name svelte-1pa9dkf">${$.escape(page.name)}</div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="details svelte-1pa9dkf"><span class="icon svelte-1pa9dkf"${$.attr_style('', { background: page_type()?.color })}>`);
				Icon($$renderer, { icon: page_type()?.icon });
				$$renderer.push(`<!----></span> <a${$.attr('href', full_url()?.href)}${$.attr_class('name svelte-1pa9dkf', void 0, { 'active': active() })}>${$.escape(page.name)}</a> <span class="url svelte-1pa9dkf">/${$.escape(page.slug)}</span></div> <div class="flex -space-x-4 svelte-1pa9dkf"><!--[-->`);

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

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (has_children()) {
				$$renderer.push(`<!--[0--><button${$.attr_class('toggle svelte-1pa9dkf', void 0, { 'active': showing_children })} aria-label="Toggle child pages">`);
				Icon($$renderer, { icon: 'mdi:chevron-down' });
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="options svelte-1pa9dkf">`);

			if (has_children() && page.id !== homepage()?.id) {
				$$renderer.push(`<!--[0--><button class="add-child-btn svelte-1pa9dkf" aria-label="Create Subpage">`);
				Icon($$renderer, { icon: 'akar-icons:plus' });
				$$renderer.push(`<!----> <span class="svelte-1pa9dkf">Create Subpage (${$.escape(children().length)})</span></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <button class="drag-handle svelte-1pa9dkf"${$.attr_style('', { visibility: page.slug === '' ? 'hidden' : 'visible' })}>`);
			Icon($$renderer, { icon: 'material-symbols:drag-handle' });
			$$renderer.push(`<!----></button> `);

			MenuPopup($$renderer, {
				icon: 'carbon:overflow-menu-vertical',
				options: [
					...!has_children() && !creating_page && page.id !== homepage()?.id
						? [
							{
								label: `Create Subpage`,
								icon: 'akar-icons:plus',
								on_click: () => {
									creating_page = true;
								}
							}
						]
						: [],

					{
						label: 'Change Name',
						icon: 'clarity:edit-solid',
						on_click: () => {
							editing_page = !editing_page;

							tick().then(() => {
								name_input_el.focus();
							});
						}
					},

					...!!page.parent
						? [
							{
								label: 'Delete',
								icon: 'ic:outline-delete',
								danger: true,
								on_click: async () => {
									const descendants = getAllDescendants(page.id);

									if (descendants.length > 0) {
										// Show warning dialog for pages with children
										pages_to_delete = [page, ...descendants];

										pending_delete = async () => {
											const parent_id = page.parent;

											// Delete the page and all descendants
											Pages.delete(page.id);

											descendants.forEach((desc) => Pages.delete(desc.id));

											// Reindex remaining sibling pages
											const sibling_pages = allPages().filter((p) => p.parent === parent_id && p.id !== page.id && !descendants.some((d) => d.id === p.id)).sort((a, b) => a.index - b.index);

											sibling_pages.forEach((sibling_page, i) => {
												const index = parent_id === homepage()?.id ? i + 1 : i;

												Pages.update(sibling_page.id, { index });
											});

											await selfManager.commit();

											toast.success(descendants.length > 0
												? `Deleted "${page.name}" and ${descendants.length} child page(s)`
												: `Deleted "${page.name}"`);

											// If the deleted page was the one open, navigate to homepage
											try {
												if (page_slug === page.slug) {
													const home_url = build_cms_page_url(homepage(), pageState.url);

													if (home_url) await goto(home_url, { replaceState: true });
												}
											} catch(e) {
												console.warn('Navigation after delete failed', e);
											}
										};

										delete_warning_dialog = true;
									} else {
										// Direct delete for pages without children
										const parent_id = page.parent;

										Pages.delete(page.id);

										// Reindex remaining sibling pages
										const sibling_pages = allPages().filter((p) => p.parent === parent_id && p.id !== page.id).sort((a, b) => a.index - b.index);

										sibling_pages.forEach((sibling_page, i) => {
											const index = parent_id === homepage()?.id ? i + 1 : i;

											Pages.update(sibling_page.id, { index });
										});

										await selfManager.commit();
										toast.success(`Deleted "${page.name}"`);

										// If the deleted page was the one open, navigate to homepage
										try {
											if (page_slug === page.slug) {
												const home_url = build_cms_page_url(homepage(), pageState.url);

												if (home_url) await goto(home_url, { replaceState: true });
											}
										} catch(e) {
											console.warn('Navigation after delete failed', e);
										}
									}
								}
							}
						]
						: []
				]
			});

			$$renderer.push(`<!----></div></div> `);

			if (creating_page) {
				$$renderer.push(`<!--[0--><div style="border-left: 0.5rem solid #111;" class="svelte-1pa9dkf">`);

				PageForm($$renderer, {
					parent: page,
					oncreate: async (new_page) => {
						creating_page = false;
						showing_children = true;

						const url_taken = allPages().some((p) => p?.slug === new_page.slug && p.parent === page.id);

						if (url_taken) {
							alert(`That URL is already in use`);
						} else {
							// Pass the correct parent and site IDs
							const site_id = site?.id || page.site;

							await oncreate({ ...new_page, parent: page.id, site: site_id });
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showing_children && has_children()) {
				$$renderer.push(`<!--[0--><div class="children-container svelte-1pa9dkf"><div${$.attr_class('drop-indicator-top svelte-1pa9dkf', void 0, {
					'active': children_hover_position === `${page.id}-children-top`
				})}><div class="svelte-1pa9dkf"></div></div> <ul class="page-list child svelte-1pa9dkf"><!--[-->`);

				const each_array_1 = $.ensure_array_like(children());

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let subpage = each_array_1[$$index_1];

					$$renderer.push(`<li class="subpage-item svelte-1pa9dkf">`);

					Item($$renderer, {
						parent: page,
						page: subpage,
						active: subpage.id === active_page_id,
						page_slug,
						active_page_id,
						oncreate,
						get hover_position() {
							return children_hover_position;
						},

						set hover_position($$value) {
							children_hover_position = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <div${$.attr_class('drop-indicator-inline svelte-1pa9dkf', void 0, { 'active': children_hover_position === `${subpage.id}-bottom` })}><div class="svelte-1pa9dkf"></div></div></li>`);
				}

				$$renderer.push(`<!--]--></ul></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return delete_warning_dialog;
					},

					set open($$value) {
						delete_warning_dialog = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[500px] p-6 pt-12',
								children: ($$renderer) => {
									$$renderer.push(`<div class="mb-6 svelte-1pa9dkf"><div class="flex items-center gap-3 mb-4 svelte-1pa9dkf"><div class="p-2 rounded-full bg-red-500/10 svelte-1pa9dkf">`);
									Icon($$renderer, { icon: 'mdi:alert-circle', class: 'w-6 h-6 text-red-500' });
									$$renderer.push(`<!----></div> <h2 class="text-lg font-semibold text-red-500 svelte-1pa9dkf">Delete Page and Children</h2></div> <p class="text-sm text-gray-400 leading-relaxed mb-4 svelte-1pa9dkf">This page has ${$.escape(pages_to_delete.length - 1)} child page(s) that will also be permanently deleted. This action cannot be undone.</p> <div class="bg-gray-900/50 rounded-lg p-3 max-h-40 overflow-y-auto svelte-1pa9dkf"><p class="text-xs text-gray-500 mb-2 font-medium svelte-1pa9dkf">Pages to be deleted:</p> <ul class="text-sm space-y-1 svelte-1pa9dkf"><!--[-->`);

									const each_array_2 = $.ensure_array_like(pages_to_delete);

									for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
										let pageToDelete = each_array_2[$$index_2];

										$$renderer.push(`<li class="flex items-center gap-2 text-gray-300 svelte-1pa9dkf">`);

										Icon($$renderer, {
											icon: 'mdi:file-document',
											class: 'w-4 h-4 text-gray-500 flex-shrink-0'
										});

										$$renderer.push(`<!----> ${$.escape(pageToDelete.name)} <span class="text-gray-500 text-xs svelte-1pa9dkf">/${$.escape(pageToDelete.slug)}</span></li>`);
									}

									$$renderer.push(`<!--]--></ul></div></div> <div class="flex gap-2 justify-end svelte-1pa9dkf">`);

									Button($$renderer, {
										variant: 'outline',
										onclick: () => {
											delete_warning_dialog = false;
											pages_to_delete = [];
											pending_delete = null;
										},

										children: ($$renderer) => {
											$$renderer.push(`<!---->Cancel`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										variant: 'destructive',
										onclick: async () => {
											if (pending_delete) {
												await pending_delete();
											}

											delete_warning_dialog = false;
											pages_to_delete = [];
											pending_delete = null;
										},

										children: ($$renderer) => {
											Icon($$renderer, { icon: 'mdi:delete', class: 'w-4 h-4 mr-1' });
											$$renderer.push(`<!----> Delete All`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div>`);
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
		$.bind_props($$props, { hover_position });
	});
}