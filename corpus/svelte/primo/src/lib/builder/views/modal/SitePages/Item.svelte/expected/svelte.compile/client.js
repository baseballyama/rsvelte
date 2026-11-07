import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="details svelte-1pa9dkf"><div class="name svelte-1pa9dkf"> </div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="details svelte-1pa9dkf"><span class="icon svelte-1pa9dkf"><!></span> <a> </a> <span class="url svelte-1pa9dkf"> </span></div> <div class="flex -space-x-4 svelte-1pa9dkf"></div>`, 1);
var root_3 = $.from_html(`<button aria-label="Toggle child pages"><!></button>`);
var root_4 = $.from_html(`<button class="add-child-btn svelte-1pa9dkf" aria-label="Create Subpage"><!> <span class="svelte-1pa9dkf"> </span></button>`);
var root_5 = $.from_html(`<div style="border-left: 0.5rem solid #111;" class="svelte-1pa9dkf"><!></div>`);
var root_6 = $.from_html(`<li class="subpage-item svelte-1pa9dkf"><!> <div><div class="svelte-1pa9dkf"></div></div></li>`);
var root_7 = $.from_html(`<div class="children-container svelte-1pa9dkf"><div><div class="svelte-1pa9dkf"></div></div> <ul class="page-list child svelte-1pa9dkf"></ul></div>`);
var root_8 = $.from_html(`<li class="flex items-center gap-2 text-gray-300 svelte-1pa9dkf"><!> <span class="text-gray-500 text-xs svelte-1pa9dkf"> </span></li>`);
var root_9 = $.from_html(`<!> Delete All`, 1);
var root_10 = $.from_html(`<div class="mb-6 svelte-1pa9dkf"><div class="flex items-center gap-3 mb-4 svelte-1pa9dkf"><div class="p-2 rounded-full bg-red-500/10 svelte-1pa9dkf"><!></div> <h2 class="text-lg font-semibold text-red-500 svelte-1pa9dkf">Delete Page and Children</h2></div> <p class="text-sm text-gray-400 leading-relaxed mb-4 svelte-1pa9dkf"> </p> <div class="bg-gray-900/50 rounded-lg p-3 max-h-40 overflow-y-auto svelte-1pa9dkf"><p class="text-xs text-gray-500 mb-2 font-medium svelte-1pa9dkf">Pages to be deleted:</p> <ul class="text-sm space-y-1 svelte-1pa9dkf"></ul></div></div> <div class="flex gap-2 justify-end svelte-1pa9dkf"><!> <!></div>`, 1);
var root_11 = $.from_html(`<div><div><div class="left svelte-1pa9dkf"><!> <!></div> <div class="options svelte-1pa9dkf"><!> <button class="drag-handle svelte-1pa9dkf"><!></button> <!></div></div> <!> <!></div> <!>`, 1);

export default function Item_1($$anchor, $$props) {
	$.push($$props, true);

	let editing_page = $.state(false);

	/** @type {Props} */
	let hover_position = $.prop($$props, 'hover_position', 15, null);

	// Get site from context (preferred) or fallback to hostname lookup
	const { value: site } = site_context.get();

	const homepage = $.derived(() => site.homepage());
	const full_url = $.derived(() => build_cms_page_url($$props.page, pageState.url));
	const allPages = $.derived(() => site?.pages() ?? []);
	const page_type = $.derived(() => PageTypes.one($$props.page.page_type));
	const related_activities = $.derived(() => getUserActivity({ filter: (activity) => activity.page?.id === $$props.page.id }));
	let showing_children = $.state(false);
	let children = $.derived(() => ($$props.page.children() ?? []).sort((a, b) => b.index - a.index));
	let has_children = $.derived(() => $.get(children).length > 0 && $$props.page.slug !== '');
	let has_toggled = $.state(false);
	const active = $.derived(() => $$props.page.id === $$props.active_page_id);

	// Local hover_position for this level's children (separate from parent's hover_position)
	// This is used to track hover position for subpages when this Item has children
	let children_hover_position = $.state(null);

	get(`page-list-toggle--${$$props.page.id}`).then((toggled) => {
		if (toggled !== undefined) $.set(showing_children, toggled, true);
	});

	$.user_effect(() => {
		set(`page-list-toggle--${$$props.page.id}`, $.get(showing_children));
	});

	let creating_page = $.state(false);
	let delete_warning_dialog = $.state(false);
	let pages_to_delete = $.state($.proxy([]));
	let pending_delete = $.state(null);

	// Function to get all descendants (children, grandchildren, etc.) of a page
	function getAllDescendants(pageId) {
		const descendants = [];
		const queue = [pageId];

		while (queue.length > 0) {
			const currentId = queue.shift();
			const children = $.get(allPages).filter((p) => p.parent === currentId);

			for (const child of children) {
				descendants.push(child);
				queue.push(child.id);
			}
		}

		return descendants;
	}

	let drag_handle_element = $.state(void 0);
	let element = $.state(void 0);

	onMount(async () => {
		draggable({
			element: $.get(element),
			dragHandle: $.get(drag_handle_element),
			getInitialData: () => ({ page: $$props.page }),
			onDragStart: () => {
				$.set(is_dragging, true);
			},

			onDrop: () => {
				$.set(is_dragging, false);
			}
		});

		dropTargetForElements({
			element: $.get(element),
			getData({ input, element }) {
				return attachClosestEdge({ page: $$props.page }, { element, input, allowedEdges: ['top', 'bottom'] });
			},

			onDrag({ self, source }) {
				// Only show indicators if dragging within the same parent level
				const page_being_dragged = source.data.page;

				const same_parent = $$props.page.parent === page_being_dragged.parent;

				if (!same_parent) {
					hover_position(null);

					return;
				}

				// Dragging - adjust indicator according to drag position
				const edge = extractClosestEdge(self.data);

				if (edge === 'bottom') {
					// Set hover position to show indicator below this item
					// For subpages, hover_position prop is passed from parent's children_hover_position
					// Since hover_position is $bindable, setting it updates the parent's value
					hover_position(`${$$props.page.id}-bottom`);
				} else if (edge === 'top') {
					// For top edge, we want to show the indicator above this item
					// which is the bottom of the previous item
					if ($$props.page.index === 0 && $$props.page.parent === '') {
						hover_position(null // Can't drop above home page
						);
					} else if ($$props.page.index === 0 && $$props.page.parent) {
						// First child in a nested level - show at top of children list
						hover_position(`${$$props.page.parent}-children-top`);
					} else {
						// Find the previous sibling
						const siblings = $.get(allPages).filter((p) => p.parent === $$props.page.parent).sort((a, b) => a.index - b.index);

						const prevIndex = siblings.findIndex((p) => p.id === $$props.page.id) - 1;

						if (prevIndex >= 0) {
							hover_position(`${siblings[prevIndex].id}-bottom`);
						}
					}
				}
			},

			onDragLeave() {
				hover_position(null);
			},

			onDrop({ self, source }) {
				// Dropped - adjust index of moved page and siblings pages
				const page_dragged_over = self.data.page;

				const page_being_dragged = source.data.page;
				const closestEdgeOfTarget = extractClosestEdge(self.data);

				// Don't allow dragging onto itself
				if (page_dragged_over.id === page_being_dragged.id) {
					hover_position(null);

					return;
				}

				// Don't allow placing above home page
				if (closestEdgeOfTarget === 'top' && page_dragged_over.index === 0 && page_dragged_over.parent === '') {
					hover_position(null);

					return;
				}

				// Check if dragging between different parent levels
				const same_parent = page_dragged_over.parent === page_being_dragged.parent;

				// Get all siblings (pages with same parent as the target)
				const siblings = $.get(allPages).filter((p) => p.parent === page_dragged_over.parent).sort((a, b) => a.index - b.index);

				const old_index = page_being_dragged.index;
				let target_index;

				if (closestEdgeOfTarget === 'top') {
					target_index = page_dragged_over.index;
				} else if (closestEdgeOfTarget === 'bottom') {
					target_index = page_dragged_over.index + 1;
				}

				hover_position(null);

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

	let is_dragging = $.state(false);
	let name_input_el;
	var fragment = root_11();
	var div = $.first_child(fragment);
	let classes;
	var div_1 = $.child(div);
	let classes_1;
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();
			var div_4 = $.child(div_3);
			var text = $.only_child(div_4, true);

			$.bind_this(div_4, ($$value) => name_input_el = $$value, () => name_input_el);

			$.action(div_4, ($$node, $$action_arg) => content_editable?.($$node, $$action_arg), () => ({
				on_change: (val) => {},
				on_submit: (val) => {
					Pages.update($$props.page.id, { name: val });
					selfManager.commit();
					$.set(editing_page, false);
				}
			}));

			$.reset(div_3);
			$.template_effect(() => $.set_text(text, $$props.page.name));
			$.append($$anchor, div_3);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_2();
			var div_5 = $.first_child(fragment_1);
			var span = $.child(div_5);
			let styles;
			var node_1 = $.child(span);

			{
				let $0 = $.derived(() => $.get(page_type)?.icon);

				Icon(node_1, {
					get icon() {
						return $.get($0);
					}
				});
			}

			$.reset(span);

			var a_1 = $.sibling(span, 2);
			let classes_2;
			var text_1 = $.only_child(a_1, true);
			var span_1 = $.sibling(a_1, 2);
			var text_2 = $.only_child(span_1);

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);

			$.each(div_6, 21, () => $.get(related_activities), $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 1));
				let user = () => $.get($$array)[0].user;
				let user_avatar = () => $.get($$array)[0].user_avatar;
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => Avatar.Root, ($$anchor, Avatar_Root) => {
					Avatar_Root($$anchor, {
						class: 'ring-background ring-2 size-5 ml-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_3 = $.first_child(fragment_3);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_4 = $.first_child(fragment_4);

									{
										let $0 = $.derived(() => user().name || user().email);

										$.component(node_4, () => Avatar.Image, ($$anchor, Avatar_Image) => {
											Avatar_Image($$anchor, {
												get src() {
													return user_avatar();
												},

												get alt() {
													return $.get($0);
												},
												class: 'object-cover object-center'
											});
										});
									}

									$.append($$anchor, fragment_4);
								};

								$.if(node_3, ($$render) => {
									if (user_avatar()) $$render(consequent_1);
								});
							}

							var node_5 = $.sibling(node_3, 2);

							$.component(node_5, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
								Avatar_Fallback($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text();

										$.template_effect(($0) => $.set_text(text_3, $0), [
											() => (user().name || user().email).slice(0, 2).toUpperCase()
										]);

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.reset(div_6);

			$.template_effect(() => {
				styles = $.set_style(span, '', styles, { background: $.get(page_type)?.color });
				$.set_attribute(a_1, 'href', $.get(full_url)?.href);
				classes_2 = $.set_class(a_1, 1, 'name svelte-1pa9dkf', null, classes_2, { active: $.get(active) });
				$.set_text(text_1, $$props.page.name);
				$.set_text(text_2, `/${$$props.page.slug ?? ''}`);
			});

			$.delegated('click', a_1, () => {});
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(editing_page)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_6 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var button = root_3();
			let classes_3;
			var node_7 = $.child(button);

			Icon(node_7, { icon: 'mdi:chevron-down' });
			$.reset(button);
			$.template_effect(() => classes_3 = $.set_class(button, 1, 'toggle svelte-1pa9dkf', null, classes_3, { active: $.get(showing_children) }));

			$.delegated('click', button, () => {
				$.set(showing_children, !$.get(showing_children));
				$.set(has_toggled, true);
			});

			$.append($$anchor, button);
		};

		$.if(node_6, ($$render) => {
			if ($.get(has_children)) $$render(consequent_2);
		});
	}

	$.reset(div_2);

	var div_7 = $.sibling(div_2, 2);
	var node_8 = $.child(div_7);

	{
		var consequent_3 = ($$anchor) => {
			var button_1 = root_4();
			var node_9 = $.child(button_1);

			Icon(node_9, { icon: 'akar-icons:plus' });

			var span_2 = $.sibling(node_9, 2);
			var text_4 = $.only_child(span_2);

			$.reset(button_1);
			$.template_effect(() => $.set_text(text_4, `Create Subpage (${$.get(children).length ?? ''})`));
			$.delegated('click', button_1, () => $.set(creating_page, true));
			$.append($$anchor, button_1);
		};

		$.if(node_8, ($$render) => {
			if ($.get(has_children) && $$props.page.id !== $.get(homepage)?.id) $$render(consequent_3);
		});
	}

	var button_2 = $.sibling(node_8, 2);
	let styles_1;
	var node_10 = $.child(button_2);

	Icon(node_10, { icon: 'material-symbols:drag-handle' });
	$.reset(button_2);
	$.bind_this(button_2, ($$value) => $.set(drag_handle_element, $$value), () => $.get(drag_handle_element));

	var node_11 = $.sibling(button_2, 2);

	{
		let $0 = $.derived(() => [
			...!$.get(has_children) && !$.get(creating_page) && $$props.page.id !== $.get(homepage)?.id
				? [
					{
						label: `Create Subpage`,
						icon: 'akar-icons:plus',
						on_click: () => {
							$.set(creating_page, true);
						}
					}
				]
				: [],

			{
				label: 'Change Name',
				icon: 'clarity:edit-solid',
				on_click: () => {
					$.set(editing_page, !$.get(editing_page));

					tick().then(() => {
						name_input_el.focus();
					});
				}
			},

			...!!$$props.page.parent
				? [
					{
						label: 'Delete',
						icon: 'ic:outline-delete',
						danger: true,
						on_click: async () => {
							const descendants = getAllDescendants($$props.page.id);

							if (descendants.length > 0) {
								// Show warning dialog for pages with children
								$.set(pages_to_delete, [$$props.page, ...descendants], true);

								$.set(pending_delete, async () => {
									const parent_id = $$props.page.parent;

									// Delete the page and all descendants
									Pages.delete($$props.page.id);

									descendants.forEach((desc) => Pages.delete(desc.id));

									// Reindex remaining sibling pages
									const sibling_pages = $.get(allPages).filter((p) => p.parent === parent_id && p.id !== $$props.page.id && !descendants.some((d) => d.id === p.id)).sort((a, b) => a.index - b.index);

									sibling_pages.forEach((sibling_page, i) => {
										const index = parent_id === $.get(homepage)?.id ? i + 1 : i;

										Pages.update(sibling_page.id, { index });
									});

									await selfManager.commit();

									toast.success(descendants.length > 0
										? `Deleted "${$$props.page.name}" and ${descendants.length} child page(s)`
										: `Deleted "${$$props.page.name}"`);

									// If the deleted page was the one open, navigate to homepage
									try {
										if ($$props.page_slug === $$props.page.slug) {
											const home_url = build_cms_page_url($.get(homepage), pageState.url);

											if (home_url) await goto(home_url, { replaceState: true });
										}
									} catch(e) {
										console.warn('Navigation after delete failed', e);
									}
								});

								$.set(delete_warning_dialog, true);
							} else {
								// Direct delete for pages without children
								const parent_id = $$props.page.parent;

								Pages.delete($$props.page.id);

								// Reindex remaining sibling pages
								const sibling_pages = $.get(allPages).filter((p) => p.parent === parent_id && p.id !== $$props.page.id).sort((a, b) => a.index - b.index);

								sibling_pages.forEach((sibling_page, i) => {
									const index = parent_id === $.get(homepage)?.id ? i + 1 : i;

									Pages.update(sibling_page.id, { index });
								});

								await selfManager.commit();
								toast.success(`Deleted "${$$props.page.name}"`);

								// If the deleted page was the one open, navigate to homepage
								try {
									if ($$props.page_slug === $$props.page.slug) {
										const home_url = build_cms_page_url($.get(homepage), pageState.url);

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
		]);

		MenuPopup(node_11, {
			icon: 'carbon:overflow-menu-vertical',
			get options() {
				return $.get($0);
			}
		});
	}

	$.reset(div_7);
	$.reset(div_1);

	var node_12 = $.sibling(div_1, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_8 = root_5();
			var node_13 = $.child(div_8);

			PageForm(node_13, {
				get parent() {
					return $$props.page;
				},

				oncreate: async (new_page) => {
					$.set(creating_page, false);
					$.set(showing_children, true);

					const url_taken = $.get(allPages).some((p) => p?.slug === new_page.slug && p.parent === $$props.page.id);

					if (url_taken) {
						alert(`That URL is already in use`);
					} else {
						// Pass the correct parent and site IDs
						const site_id = site?.id || $$props.page.site;

						await $$props.oncreate({ ...new_page, parent: $$props.page.id, site: site_id });
					}
				}
			});

			$.reset(div_8);
			$.transition(3, div_8, () => slide, () => ({ duration: 200 }));
			$.append($$anchor, div_8);
		};

		$.if(node_12, ($$render) => {
			if ($.get(creating_page)) $$render(consequent_4);
		});
	}

	var node_14 = $.sibling(node_12, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_9 = root_7();
			var div_10 = $.child(div_9);
			let classes_4;
			var ul = $.sibling(div_10, 2);

			$.each(ul, 29, () => $.get(children), (subpage) => subpage.id, ($$anchor, subpage) => {
				var li = root_6();
				var node_15 = $.child(li);

				{
					let $0 = $.derived(() => $.get(subpage).id === $$props.active_page_id);

					Item(node_15, {
						get parent() {
							return $$props.page;
						},

						get page() {
							return $.get(subpage);
						},

						get active() {
							return $.get($0);
						},

						get page_slug() {
							return $$props.page_slug;
						},

						get active_page_id() {
							return $$props.active_page_id;
						},

						get oncreate() {
							return $$props.oncreate;
						},

						get hover_position() {
							return $.get(children_hover_position);
						},

						set hover_position($$value) {
							$.set(children_hover_position, $$value, true);
						},

						$$events: {
							delete: function ($$arg) {
								$.bubble_event.call(this, $$props, $$arg);
							},

							create: function ($$arg) {
								$.bubble_event.call(this, $$props, $$arg);
							}
						}
					});
				}

				var div_11 = $.sibling(node_15, 2);
				let classes_5;

				$.reset(li);

				$.template_effect(() => classes_5 = $.set_class(div_11, 1, 'drop-indicator-inline svelte-1pa9dkf', null, classes_5, {
					active: $.get(children_hover_position) === `${$.get(subpage).id}-bottom`
				}));

				$.animation(li, () => flip, () => ({ duration: 200 }));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_9);

			$.template_effect(() => classes_4 = $.set_class(div_10, 1, 'drop-indicator-top svelte-1pa9dkf', null, classes_4, {
				active: $.get(children_hover_position) === `${$$props.page.id}-children-top`
			}));

			$.transition(3, ul, () => slide, () => ({ duration: $.get(has_toggled) ? 100 : 0 }));
			$.append($$anchor, div_9);
		};

		$.if(node_14, ($$render) => {
			if ($.get(showing_children) && $.get(has_children)) $$render(consequent_5);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(element, $$value), () => $.get(element));

	var node_16 = $.sibling(div, 2);

	$.component(node_16, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(delete_warning_dialog);
			},

			set open($$value) {
				$.set(delete_warning_dialog, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_6 = $.comment();
				var node_17 = $.first_child(fragment_6);

				$.component(node_17, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-[500px] p-6 pt-12',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_10();
							var div_12 = $.first_child(fragment_7);
							var div_13 = $.child(div_12);
							var div_14 = $.child(div_13);
							var node_18 = $.child(div_14);

							Icon(node_18, { icon: 'mdi:alert-circle', class: 'w-6 h-6 text-red-500' });
							$.reset(div_14);
							$.next(2);
							$.reset(div_13);

							var p_1 = $.sibling(div_13, 2);
							var text_5 = $.only_child(p_1);
							var div_15 = $.sibling(p_1, 2);
							var ul_1 = $.sibling($.child(div_15), 2);

							$.each(ul_1, 21, () => $.get(pages_to_delete), $.index, ($$anchor, pageToDelete) => {
								var li_1 = root_8();
								var node_19 = $.child(li_1);

								Icon(node_19, {
									icon: 'mdi:file-document',
									class: 'w-4 h-4 text-gray-500 flex-shrink-0'
								});

								var text_6 = $.sibling(node_19);
								var span_3 = $.sibling(text_6);
								var text_7 = $.only_child(span_3);

								$.reset(li_1);

								$.template_effect(() => {
									$.set_text(text_6, ` ${$.get(pageToDelete).name ?? ''} `);
									$.set_text(text_7, `/${$.get(pageToDelete).slug ?? ''}`);
								});

								$.append($$anchor, li_1);
							});

							$.reset(ul_1);
							$.reset(div_15);
							$.reset(div_12);

							var div_16 = $.sibling(div_12, 2);
							var node_20 = $.child(div_16);

							Button(node_20, {
								variant: 'outline',
								onclick: () => {
									$.set(delete_warning_dialog, false);
									$.set(pages_to_delete, [], true);
									$.set(pending_delete, null);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Cancel');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_21 = $.sibling(node_20, 2);

							Button(node_21, {
								variant: 'destructive',
								onclick: async () => {
									if ($.get(pending_delete)) {
										await $.get(pending_delete)();
									}

									$.set(delete_warning_dialog, false);
									$.set(pages_to_delete, [], true);
									$.set(pending_delete, null);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_9();
									var node_22 = $.first_child(fragment_8);

									Icon(node_22, { icon: 'mdi:delete', class: 'w-4 h-4 mr-1' });
									$.next();
									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							$.reset(div_16);
							$.template_effect(() => $.set_text(text_5, `This page has ${$.get(pages_to_delete).length - 1} child page(s) that will also be permanently deleted. This action cannot be undone.`));
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'Item svelte-1pa9dkf', null, classes, {
			'contains-child': $$props.parent,
			dragging: $.get(is_dragging)
		});

		classes_1 = $.set_class(div_1, 1, 'page-item-container svelte-1pa9dkf', null, classes_1, {
			active: $.get(active),
			expanded: $.get(showing_children) && $.get(has_children)
		});

		styles_1 = $.set_style(button_2, '', styles_1, { visibility: $$props.page.slug === '' ? 'hidden' : 'visible' });
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);