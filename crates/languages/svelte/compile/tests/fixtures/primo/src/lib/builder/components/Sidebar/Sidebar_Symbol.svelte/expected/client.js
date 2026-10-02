import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as _ from 'lodash-es';
import { fade } from 'svelte/transition';
import Icon from '@iconify/svelte';
import Toggle from 'svelte-toggle';
import { Button } from '$lib/components/ui/button';
import * as Dialog from '$lib/components/ui/dialog';
import { Input } from '$lib/components/ui/input';
import MenuPopup from '../../ui/Dropdown.svelte';
import { locale, mod_key_held } from '../../stores/app/misc';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import IFrame from '../../components/IFrame.svelte';
import { createEventDispatcher, onMount } from 'svelte';
import { watch } from 'runed';
import { block_html } from '$lib/builder/code_generators';
import { SiteSymbols } from '$lib/pocketbase/collections';
import { useExportSiteSymbol } from '$lib/workers/ExportSymbol.svelte';
import { useContent } from '$lib/Content.svelte';
import { Badge } from '$lib/components/ui/badge';
import * as Tooltip from '$lib/components/ui/tooltip';
import { page_context, page_type_context } from '$lib/builder/stores/context';
import { PageTypes, PageTypeFields } from '$lib/pocketbase/collections';
import { Unlink } from 'lucide-svelte';
import * as Avatar from '$lib/components/ui/avatar/index.js';
import { self } from '$lib/pocketbase/managers';
import { getUserActivity } from '$lib/UserActivity.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<h2 class="text-lg font-semibold leading-none tracking-tight">Rename Block</h2> <p class="text-muted-foreground text-sm">Enter a new name for your Block</p> <form><!> <!></form>`, 1);
var root_2 = $.from_html(`<!> <span class="ml-1">Foreign Page Field</span>`, 1);
var root_3 = $.from_html(`<div class="overlay-actions svelte-ykqz1w"><button class="svelte-ykqz1w"><!></button> <button class="svelte-ykqz1w"><!></button> <button class="svelte-ykqz1w"><!></button> <button class="delete svelte-ykqz1w"><!></button></div>`);
var root_4 = $.from_html(`<div class="symbol-options svelte-ykqz1w"><!></div>`);
var root_5 = $.from_html(`<div class="error svelte-ykqz1w"></div>`);
var root_6 = $.from_html(`<div class="loading svelte-ykqz1w"><!></div>`);
var root_7 = $.from_html(`<div class="absolute z-10 bg-[#222] p-1 right-0 top-0 rounded-bl-lg flex justify-center -space-x-1"><!></div>`);
var root_8 = $.from_html(`<!> <div class="symbol svelte-ykqz1w"><!></div>`, 1);
var root_9 = $.from_html(`<!> <div class="sidebar-symbol svelte-ykqz1w"><header class="svelte-ykqz1w"><div class="name svelte-ykqz1w"><h3 class="svelte-ykqz1w"> </h3> <!> <!></div> <!></header> <div><!></div></div>`, 1);

export default function Sidebar_Symbol($$anchor, $$props) {
	$.push($$props, true);

	const $locale = () => $.store_get(locale, '$locale', $$stores);
	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const dispatch = createEventDispatcher();

	let controls_enabled = $.prop($$props, 'controls_enabled', 3, true),
		show_toggle = $.prop($$props, 'show_toggle', 3, false),
		toggled = $.prop($$props, 'toggled', 3, false),
		head = $.prop($$props, 'head', 3, ''),
		active_page_type_id = $.prop($$props, 'active_page_type_id', 3, null);

	let name_el = void 0;
	let renaming = $.state(false);
	let new_name = $.state($.proxy($$props.symbol.name));

	const related_activities = $.derived(() => getUserActivity({
		filter: ({ site_symbol }) => site_symbol?.id === $$props.symbol.id
	}));

	async function save_rename() {
		if (!$$props.symbol || !$.get(new_name).trim()) return;

		try {
			SiteSymbols.update($$props.symbol.id, { name: $.get(new_name).trim() });
			await self.commit();
			$.set(renaming, false);
		} catch(error) {
			console.warn('Failed to rename symbol:', error);
		}
	}

	let height = $.state(0);
	const _data = $.derived(() => useContent($$props.symbol, { target: 'cms' }));
	const data = $.derived(() => $.get(_data) && ($.get(_data)[$locale()] ?? {}));

	// Foreign Page Field chip: detect when this block references Page Fields
	// from a different page type than the active one (page or page type context)
	const { value: page_ctx } = page_context.getOr({ value: null });

	const { value: page_type_ctx } = page_type_context.getOr({ value: null });

	const active_page_type = $.derived(() => {
		if (active_page_type_id()) return PageTypes.one(active_page_type_id());
		if (page_type_ctx) return page_type_ctx;
		if (page_ctx) return PageTypes.one(page_ctx.page_type);

		return null;
	});

	const symbol_fields = $.derived(() => $$props.symbol?.fields?.() ?? []);

	const foreign_page_types = $.derived(() => {
		if (!$.get(active_page_type)) return [];

		const ids = new Set();

		for (const f of $.get(symbol_fields)) {
			if (f.type !== 'page-field') continue;

			const target = f.config?.field ? PageTypeFields.one(f.config.field) : null;

			if (!target) continue;

			if (target.page_type && target.page_type !== $.get(active_page_type).id) {
				ids.add(target.page_type);
			}
		}

		return Array.from(ids);
	});

	const foreign_chip_title = $.derived(() => {
		if (!$.get(foreign_page_types).length) return '';

		const names = $.get(foreign_page_types).map((id) => PageTypes.one(id)).filter(Boolean).map((pt) => pt.name).join(', ');

		return names
			? `References Page Fields from ${names}.`
			: 'Uses Page Field(s) from another page type';
	});

	let componentCode = $.state(void 0);
	let component_error = $.state(void 0);
	let is_loading = $.state(true);

	// Rebuild preview whenever code or data meaningfully change
	let last_signature = $.state(void 0);

	watch(
		() => ({
			html: $$props.symbol.html,
			css: $$props.symbol.css,
			js: $$props.symbol.js,
			data: $.get(data)
		}),
		({ html, css, js, data }) => {
			const signature = { html, css, js, data };

			if (_.isEqual($.get(last_signature), signature) || !data) return;

			$.set(last_signature, _.cloneDeep(signature), true);
			$.set(is_loading, true);
			$.set(component_error, undefined);

			try {
				const blockData = data || {};

				block_html({ code: { html, css, js }, data: blockData }).then((res) => {
					if (res && res.body) {
						$.set(componentCode, res, true);
					}
				});
			} catch(error) {
				console.error('Sidebar symbol error for', $$props.symbol.name, ':', error);
				$.set(component_error, error, true);
			} finally {
				$.set(is_loading, false);
			}
		}
	);

	let element = $.state(void 0);

	$.user_effect(() => {
		if ($.get(element)) {
			draggable({
				element: $.get(element),
				getInitialData: () => ({ block: $$props.symbol }),
				onDragStart: () => {
					if (typeof window !== 'undefined') {
						const detail = { block: $$props.symbol };

						window.dispatchEvent(new CustomEvent('primoDragStart', { detail }));

						// Backwards-compatible alias for external listeners
						window.dispatchEvent(new CustomEvent('palaDragStart', { detail }));
					}
				},

				onDrop: () => {
					if (typeof window !== 'undefined') {
						const detail = { block: $$props.symbol };

						window.dispatchEvent(new CustomEvent('primoDragEnd', { detail }));

						// Backwards-compatible alias for external listeners
						window.dispatchEvent(new CustomEvent('palaDragEnd', { detail }));
					}
				}
			});
		}
	});

	// move cursor to end of name
	$.user_effect(() => {
		if (name_el) {
			const range = document.createRange();
			const sel = window.getSelection();

			range.setStart(name_el, 1);
			range.collapse(true);
			sel?.removeAllRanges();
			sel?.addRange(range);
		}
	});

	// Export symbol
	const exportSymbol = $.derived(() => useExportSiteSymbol($$props.symbol.id));

	async function export_symbol() {
		try {
			await $.get(exportSymbol).run();
		} catch(error) {
			console.error('Failed to export symbol:', error);
		}
	}

	var fragment = root_9();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(renaming);
			},

			set open($$value) {
				$.set(renaming, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-[425px] pt-12 gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var form = $.sibling($.first_child(fragment_2), 4);
							var node_2 = $.child(form);

							Input(node_2, {
								placeholder: 'Enter new Block name',
								class: 'my-4',
								get value() {
									return $.get(new_name);
								},

								set value($$value) {
									$.set(new_name, $$value, true);
								}
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										Button(node_4, {
											type: 'button',
											variant: 'outline',
											onclick: () => $.set(renaming, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Cancel');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});

										var node_5 = $.sibling(node_4, 2);

										Button(node_5, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Rename');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form);

							$.event('submit', form, (e) => {
								e.preventDefault();
								save_rename();
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var div = $.sibling(node, 2);
	var header = $.child(div);
	var div_1 = $.child(header);
	var h3 = $.child(div_1);
	var text_2 = $.only_child(h3, true);
	var node_6 = $.sibling(h3, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_7 = $.first_child(fragment_4);

			$.component(node_7, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
				Tooltip_Provider($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_8 = $.first_child(fragment_5);

						$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
							Tooltip_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_9 = $.first_child(fragment_6);

									$.component(node_9, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
										Tooltip_Trigger($$anchor, {
											children: ($$anchor, $$slotProps) => {
												{
													let $0 = $.derived(() => toggled() ? 'destructive' : 'secondary');

													Badge($$anchor, {
														get variant() {
															return $.get($0);
														},
														class: 'ml-2',
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = $.comment();
															var node_10 = $.first_child(fragment_8);

															{
																var consequent = ($$anchor) => {
																	var fragment_9 = root_2();
																	var node_11 = $.first_child(fragment_9);

																	Unlink(node_11, { class: 'w-3 h-3' });
																	$.next(2);
																	$.append($$anchor, fragment_9);
																};

																var alternate = ($$anchor) => {
																	Unlink($$anchor, { class: 'w-3 h-3' });
																};

																$.if(node_10, ($$render) => {
																	if (toggled()) $$render(consequent); else $$render(alternate, -1);
																});
															}

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												}
											},
											$$slots: { default: true }
										});
									});

									var node_12 = $.sibling(node_9, 2);

									$.component(node_12, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
										Tooltip_Content($$anchor, {
											side: 'top',
											align: 'start',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text();

												$.template_effect(() => $.set_text(text_3, $.get(foreign_chip_title)));
												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		};

		$.if(node_6, ($$render) => {
			if ($.get(foreign_page_types).length > 0) $$render(consequent_1);
		});
	}

	var node_13 = $.sibling(node_6, 2);

	{
		var consequent_2 = ($$anchor) => {};

		$.if(node_13, ($$render) => {
			if (controls_enabled()) $$render(consequent_2);
		});
	}

	$.reset(div_1);

	var node_14 = $.sibling(div_1, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_2 = root_4();
			var node_15 = $.child(div_2);

			{
				var consequent_3 = ($$anchor) => {
					var div_3 = root_3();
					var button = $.child(div_3);
					var node_16 = $.child(button);

					Icon(node_16, { icon: 'material-symbols:code' });
					$.reset(button);

					var button_1 = $.sibling(button, 2);
					var node_17 = $.child(button_1);

					Icon(node_17, { icon: 'material-symbols:download' });
					$.reset(button_1);

					var button_2 = $.sibling(button_1, 2);
					var node_18 = $.child(button_2);

					Icon(node_18, { icon: 'material-symbols:edit' });
					$.reset(button_2);

					var button_3 = $.sibling(button_2, 2);
					var node_19 = $.child(button_3);

					Icon(node_19, { icon: 'ic:outline-delete' });
					$.reset(button_3);
					$.reset(div_3);
					$.delegated('click', button, () => dispatch('edit'));
					$.delegated('click', button_1, () => export_symbol());

					$.delegated('click', button_2, () => {
						$.set(new_name, $$props.symbol.name, true);
						$.set(renaming, true);
					});

					$.delegated('click', button_3, () => dispatch('delete'));
					$.append($$anchor, div_3);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_12 = root();
					var node_20 = $.first_child(fragment_12);

					{
						var consequent_4 = ($$anchor) => {
							{
								let $0 = $.derived(() => !!$.get(component_error));

								Toggle($$anchor, {
									label: 'Toggle Symbol for Page Type',
									get disabled() {
										return $.get($0);
									},
									hideLabel: true,
									get toggled() {
										return toggled();
									},
									small: true,
									$$events: {
										toggle: function ($$arg) {
											$.bubble_event.call(this, $$props, $$arg);
										}
									}
								});
							}
						};

						$.if(node_20, ($$render) => {
							if (show_toggle()) $$render(consequent_4);
						});
					}

					var node_21 = $.sibling(node_20, 2);

					MenuPopup(node_21, {
						icon: 'carbon:overflow-menu-vertical',
						options: [
							{
								label: 'Edit',
								icon: 'material-symbols:code',
								on_click: () => {
									dispatch('edit');
								}
							},

							{
								label: 'Export',
								icon: 'material-symbols:download',
								on_click: () => {
									export_symbol();
								}
							},

							{
								label: 'Rename',
								icon: 'material-symbols:edit',
								on_click: () => {
									$.set(new_name, $$props.symbol.name, true);
									$.set(renaming, true);
								}
							},

							{
								label: 'Delete',
								icon: 'ic:outline-delete',
								on_click: () => {
									dispatch('delete');
								}
							}
						]
					});

					$.append($$anchor, fragment_12);
				};

				$.if(node_15, ($$render) => {
					if ($mod_key_held()) $$render(consequent_3); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_14, ($$render) => {
			if (controls_enabled()) $$render(consequent_5);
		});
	}

	$.reset(header);

	var div_4 = $.sibling(header, 2);
	let classes;
	var node_22 = $.child(div_4);

	{
		var consequent_6 = ($$anchor) => {
			var div_5 = root_5();

			$.append($$anchor, div_5);
		};

		var consequent_7 = ($$anchor) => {
			var div_6 = root_6();
			var node_23 = $.child(div_6);

			Icon(node_23, { icon: 'eos-icons:three-dots-loading' });
			$.reset(div_6);
			$.append($$anchor, div_6);
		};

		var consequent_9 = ($$anchor) => {
			var fragment_14 = root_8();
			var node_24 = $.first_child(fragment_14);

			$.each(node_24, 17, () => $.get(related_activities), $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 1));
				let activity = () => $.get($$array)[0];
				var div_7 = root_7();
				var node_25 = $.child(div_7);

				$.component(node_25, () => Avatar.Root, ($$anchor, Avatar_Root) => {
					Avatar_Root($$anchor, {
						class: 'ring-background ring-2 size-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = root();
							var node_26 = $.first_child(fragment_15);

							{
								var consequent_8 = ($$anchor) => {
									var fragment_16 = $.comment();
									var node_27 = $.first_child(fragment_16);

									{
										let $0 = $.derived(() => activity().user.name || activity().user.email);

										$.component(node_27, () => Avatar.Image, ($$anchor, Avatar_Image) => {
											Avatar_Image($$anchor, {
												get src() {
													return activity().user_avatar;
												},

												get alt() {
													return $.get($0);
												},
												class: 'object-cover object-center'
											});
										});
									}

									$.append($$anchor, fragment_16);
								};

								$.if(node_26, ($$render) => {
									if (activity().user_avatar) $$render(consequent_8);
								});
							}

							var node_28 = $.sibling(node_26, 2);

							$.component(node_28, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
								Avatar_Fallback($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text();

										$.template_effect(($0) => $.set_text(text_4, $0), [
											() => (activity().user.name || activity().user.email).slice(0, 2).toUpperCase()
										]);

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_7);
				$.transition(3, div_7, () => fade);
				$.append($$anchor, div_7);
			});

			var div_8 = $.sibling(node_24, 2);
			var node_29 = $.child(div_8);

			IFrame(node_29, {
				get head() {
					return head();
				},

				get componentCode() {
					return $.get(componentCode);
				},

				get height() {
					return $.get(height);
				},

				set height($$value) {
					$.set(height, $$value, true);
				}
			});

			$.reset(div_8);
			$.append($$anchor, fragment_14);
		};

		$.if(node_22, ($$render) => {
			if ($.get(component_error)) $$render(consequent_6); else if ($.get(is_loading)) $$render(consequent_7, 1); else if ($.get(componentCode)) $$render(consequent_9, 2);
		});
	}

	$.reset(div_4);
	$.bind_this(div_4, ($$value) => $.set(element, $$value), () => $.get(element));
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_2, $$props.symbol.name);
		classes = $.set_class(div_4, 1, 'symbol-container svelte-ykqz1w', null, classes, { disabled: $.get(component_error) });
		$.set_attribute(div_4, 'data-test-id', `symbol-${$$props.symbol.id ?? ''}`);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);