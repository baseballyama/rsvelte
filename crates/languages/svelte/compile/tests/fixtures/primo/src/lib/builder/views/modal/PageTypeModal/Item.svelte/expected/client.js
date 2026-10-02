import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="Item svelte-19dvrs8"><span class="icon svelte-19dvrs8"><!></span> <div><div class="left svelte-19dvrs8"><a class="name svelte-19dvrs8"> </a> <div class="flex -space-x-4"></div></div> <div class="options svelte-19dvrs8"><!></div></div></div>`);
var root_2 = $.from_html(`This action permanently deletes <strong> </strong> and all its pages.`, 1);
var root_3 = $.from_html(`<div class="flex items-center gap-2 text-sm text-muted-foreground"><!> Loading pages…</div>`);
var root_4 = $.from_html(`<div class="text-sm text-muted-foreground">No pages use this type.</div>`);
var root_5 = $.from_html(`<code class="text-xs text-muted-foreground"> </code>`);
var root_6 = $.from_html(`<li class="px-3 py-2 flex items-center justify-between gap-2"><span class="truncate"> </span> <!></li>`);
var root_7 = $.from_html(`<div class="max-h-56 overflow-auto rounded border border-border/50"><ul class="divide-y divide-border/50 text-sm"></ul></div>`);
var root_8 = $.from_html(`<div class="animate-spin absolute"><!></div>`);
var root_9 = $.from_html(`<!> <div class="mt-2 space-y-2"><div class="text-sm text-muted-foreground"> </div> <!></div> <!>`, 1);
var root_10 = $.from_html(`<div style="border-left: 0.5rem solid #111;"><!></div>`);
var root_11 = $.from_html(`<!> <!> <!>`, 1);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	const { value: site } = site_context.get();
	let editing_page_type = $.state(false);
	let is_delete_open = $.state(false);
	let deleting_page_type = $.state(false);

	async function delete_page_type() {
		$.set(deleting_page_type, true);

		try {
			if (!site) return;

			// Delete all pages belonging to this page type (no cascade on pages.page_type)
			const pages = await pb.instance?.collection('pages').getFullList({
				filter: `page_type = \"${$$props.page_type.id}\" && site = \"${site.id}\"`
			}) ?? [];

			for (const p of pages) {
				Pages.delete(p.id);
			}

			// Delete the page type (will cascade to related type records)
			PageTypes.delete($$props.page_type.id);

			await self.commit();
			$.set(is_delete_open, false);
		} catch(error) {
			console.error('Error deleting page type:', error);
		} finally {
			$.set(deleting_page_type, false);
		}
	}

	let creating_page = $.state(false);
	let new_page_url = $.state('');

	$.user_effect(() => {
		$.set(new_page_url, validate_url($.get(new_page_url)), true);
	});

	const full_url = $.derived(() => () => {
		const base_path = page.url.pathname.includes('/sites/') ? `/admin/sites/${site?.id}` : '/admin/site';

		return `${base_path}/page-type--${$$props.page_type.id}`;
	});

	const related_activities = $.derived(() => getUserActivity({
		filter: (activity) => activity.page_type?.id === $$props.page_type.id
	}));

	// Load pages that would be deleted when confirming
	const pages_to_delete = $.derived(() => $.get(is_delete_open) && site
		? Pages.list({
			filter: { page_type: $$props.page_type.id, site: site.id },
			sort: 'index'
		}) ?? undefined
		: undefined);

	var fragment = root_11();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			PageForm($$anchor, {
				get new_page_name() {
					return $$props.page_type.name;
				},

				get new_color() {
					return $$props.page_type.color;
				},

				get new_icon() {
					return $$props.page_type.icon;
				},

				$$events: {
					create: ({ detail: modified_page }) => {
						$.set(editing_page_type, false);
						PageTypes.update($$props.page_type.id, modified_page);
						self.commit();
					}
				}
			});
		};

		var alternate = ($$anchor) => {
			var div = root_1();
			var span = $.child(div);
			let styles;
			var node_1 = $.child(span);

			Icon(node_1, {
				get icon() {
					return $$props.page_type.icon;
				}
			});

			$.reset(span);

			var div_1 = $.sibling(span, 2);
			let classes;
			var div_2 = $.child(div_1);
			var a = $.child(div_2);
			var text = $.only_child(a, true);
			var div_3 = $.sibling(a, 2);

			$.each(div_3, 21, () => $.get(related_activities), $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 1));
				let user = () => $.get($$array)[0].user;
				let user_avatar = () => $.get($$array)[0].user_avatar;
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => Avatar.Root, ($$anchor, Avatar_Root) => {
					Avatar_Root($$anchor, {
						class: 'ring-background ring-2 size-5 ml-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
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

										var text_1 = $.text();

										$.template_effect(($0) => $.set_text(text_1, $0), [
											() => (user().name || user().email).slice(0, 2).toUpperCase()
										]);

										$.append($$anchor, text_1);
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

			$.reset(div_3);
			$.reset(div_2);

			var div_4 = $.sibling(div_2, 2);
			var node_6 = $.child(div_4);

			{
				let $0 = $.derived(() => [
					{
						label: 'Edit Page Type',
						icon: 'clarity:edit-solid',
						on_click: () => {
							$.set(editing_page_type, !$.get(editing_page_type));
						}
					},

					...$$props.page_type.name !== 'Default'
						? [
							{
								label: 'Delete Type & Pages',
								icon: 'fluent:delete-20-filled',
								on_click: () => {
									$.set(is_delete_open, true);
								}
							}
						]
						: []
				]);

				MenuPopup(node_6, {
					icon: 'carbon:overflow-menu-vertical',
					get options() {
						return $.get($0);
					}
				});
			}

			$.reset(div_4);
			$.reset(div_1);
			$.reset(div);

			$.template_effect(
				($0) => {
					styles = $.set_style(span, '', styles, { background: $$props.page_type.color });
					classes = $.set_class(div_1, 1, 'page-item-container svelte-19dvrs8', null, classes, { active: $$props.active });
					$.set_attribute(a, 'href', $0);
					$.set_text(text, $$props.page_type.name);
				},
				[() => $.get(full_url)()]
			);

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(editing_page_type)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_7 = $.sibling(node, 2);

	$.component(node_7, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			get open() {
				return $.get(is_delete_open);
			},

			set open($$value) {
				$.set(is_delete_open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_6 = $.comment();
				var node_8 = $.first_child(fragment_6);

				$.component(node_8, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						class: 'z-[1001]',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_9();
							var node_9 = $.first_child(fragment_7);

							$.component(node_9, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root();
										var node_10 = $.first_child(fragment_8);

										$.component(node_10, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Delete page type?');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_10, 2);

										$.component(node_11, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_9 = root_2();
													var strong = $.sibling($.first_child(fragment_9));
													var text_3 = $.only_child(strong, true);

													$.next();
													$.template_effect(() => $.set_text(text_3, $$props.page_type.name));
													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							var div_5 = $.sibling(node_9, 2);
							var div_6 = $.child(div_5);
							var text_4 = $.only_child(div_6);
							var node_12 = $.sibling(div_6, 2);

							{
								var consequent_2 = ($$anchor) => {
									var div_7 = root_3();
									var node_13 = $.child(div_7);

									Loader(node_13, { class: 'animate-spin h-4 w-4' });
									$.next();
									$.reset(div_7);
									$.append($$anchor, div_7);
								};

								var consequent_3 = ($$anchor) => {
									var div_8 = root_4();

									$.append($$anchor, div_8);
								};

								var alternate_1 = ($$anchor) => {
									var div_9 = root_7();
									var ul = $.child(div_9);

									$.each(ul, 21, () => $.get(pages_to_delete), $.index, ($$anchor, p) => {
										var li = root_6();
										var span_1 = $.child(li);
										var text_5 = $.only_child(span_1, true);
										var node_14 = $.sibling(span_1, 2);

										{
											var consequent_4 = ($$anchor) => {
												var code = root_5();
												var text_6 = $.only_child(code);

												$.template_effect(() => $.set_text(text_6, `/${$.get(p).slug ?? ''}`));
												$.append($$anchor, code);
											};

											$.if(node_14, ($$render) => {
												if ($.get(p).slug) $$render(consequent_4);
											});
										}

										$.reset(li);
										$.template_effect(() => $.set_text(text_5, $.get(p).name));
										$.append($$anchor, li);
									});

									$.reset(ul);
									$.reset(div_9);
									$.append($$anchor, div_9);
								};

								$.if(node_12, ($$render) => {
									if ($.get(pages_to_delete) === undefined) $$render(consequent_2); else if ($.get(pages_to_delete).length === 0) $$render(consequent_3, 1); else $$render(alternate_1, -1);
								});
							}

							$.reset(div_5);

							var node_15 = $.sibling(div_5, 2);

							$.component(node_15, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root();
										var node_16 = $.first_child(fragment_10);

										$.component(node_16, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Cancel');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
											AlertDialog_Action($$anchor, {
												onclick: delete_page_type,
												class: 'bg-red-600 hover:bg-red-700',
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = $.comment();
													var node_18 = $.first_child(fragment_11);

													{
														var consequent_5 = ($$anchor) => {
															var div_10 = root_8();
															var node_19 = $.child(div_10);

															Loader(node_19, {});
															$.reset(div_10);
															$.append($$anchor, div_10);
														};

														var alternate_2 = ($$anchor) => {
															var text_8 = $.text();

															$.template_effect(() => $.set_text(text_8, `Delete ${$$props.page_type.name ?? ''}`));
															$.append($$anchor, text_8);
														};

														$.if(node_18, ($$render) => {
															if ($.get(deleting_page_type)) $$render(consequent_5); else $$render(alternate_2, -1);
														});
													}

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});

							$.template_effect(() => $.set_text(text_4, `Pages to be deleted (${($.get(pages_to_delete) ? $.get(pages_to_delete).length : '…') ?? ''}):`));
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

	var node_20 = $.sibling(node_7, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_11 = root_10();
			var node_21 = $.child(div_11);

			PageForm(node_21, {
				$$events: {
					create: ({ detail: page }) => {
						if (!site) return;

						$.set(creating_page, false);
						PageTypes.create(page);
						self.commit();

						// TODO: test & configure navigating to new page type
						// site.data.page_types.push(page)
						// const [created_page_type] = site.data.page_types.slice(-1)
						// goto(`/${site.id}/page-type--${created_page_type.id}`)
					}
				}
			});

			$.reset(div_11);
			$.append($$anchor, div_11);
		};

		$.if(node_20, ($$render) => {
			if ($.get(creating_page)) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}