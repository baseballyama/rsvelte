import * as $ from 'svelte/internal/server';
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

export default function Sidebar_Symbol($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const dispatch = createEventDispatcher();

		let {
			symbol,
			controls_enabled = true,
			show_toggle = false,
			toggled = false,
			head = '',
			active_page_type_id = null
		} = $$props;

		let name_el = void 0;
		let renaming = false;
		let new_name = symbol.name;
		const related_activities = $.derived(() => getUserActivity({ filter: ({ site_symbol }) => site_symbol?.id === symbol.id }));

		async function save_rename() {
			if (!symbol || !new_name.trim()) return;

			try {
				SiteSymbols.update(symbol.id, { name: new_name.trim() });
				await self.commit();
				renaming = false;
			} catch(error) {
				console.warn('Failed to rename symbol:', error);
			}
		}

		let height = 0;
		const _data = $.derived(() => useContent(symbol, { target: 'cms' }));
		const data = $.derived(() => _data() && (_data()[$.store_get($$store_subs ??= {}, '$locale', locale)] ?? {}));

		// Foreign Page Field chip: detect when this block references Page Fields
		// from a different page type than the active one (page or page type context)
		const { value: page_ctx } = page_context.getOr({ value: null });

		const { value: page_type_ctx } = page_type_context.getOr({ value: null });

		const active_page_type = $.derived(() => {
			if (active_page_type_id) return PageTypes.one(active_page_type_id);
			if (page_type_ctx) return page_type_ctx;
			if (page_ctx) return PageTypes.one(page_ctx.page_type);

			return null;
		});

		const symbol_fields = $.derived(() => symbol?.fields?.() ?? []);

		const foreign_page_types = $.derived(() => {
			if (!active_page_type()) return [];

			const ids = new Set();

			for (const f of symbol_fields()) {
				if (f.type !== 'page-field') continue;

				const target = f.config?.field ? PageTypeFields.one(f.config.field) : null;

				if (!target) continue;

				if (target.page_type && target.page_type !== active_page_type().id) {
					ids.add(target.page_type);
				}
			}

			return Array.from(ids);
		});

		const foreign_chip_title = $.derived(() => {
			if (!foreign_page_types().length) return '';

			const names = foreign_page_types().map((id) => PageTypes.one(id)).filter(Boolean).map((pt) => pt.name).join(', ');

			return names
				? `References Page Fields from ${names}.`
				: 'Uses Page Field(s) from another page type';
		});

		let componentCode = void 0;
		let component_error = void 0;
		let is_loading = true;

		// Rebuild preview whenever code or data meaningfully change
		let last_signature = void 0;

		watch(
			() => ({
				html: symbol.html,
				css: symbol.css,
				js: symbol.js,
				data: data()
			}),
			({ html, css, js, data }) => {
				const signature = { html, css, js, data };

				if (_.isEqual(last_signature, signature) || !data) return;

				last_signature = _.cloneDeep(signature);
				is_loading = true;
				component_error = undefined;

				try {
					const blockData = data || {};

					block_html({ code: { html, css, js }, data: blockData }).then((res) => {
						if (res && res.body) {
							componentCode = res;
						}
					});
				} catch(error) {
					console.error('Sidebar symbol error for', symbol.name, ':', error);
					component_error = error;
				} finally {
					is_loading = false;
				}
			}
		);

		let element = void 0;

		// Backwards-compatible alias for external listeners
		// Backwards-compatible alias for external listeners
		// move cursor to end of name
		// Export symbol
		const exportSymbol = $.derived(() => useExportSiteSymbol(symbol.id));

		async function export_symbol() {
			try {
				await exportSymbol().run();
			} catch(error) {
				console.error('Failed to export symbol:', error);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return renaming;
					},

					set open($$value) {
						renaming = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-[425px] pt-12 gap-0',
								children: ($$renderer) => {
									$$renderer.push(`<h2 class="text-lg font-semibold leading-none tracking-tight">Rename Block</h2> <p class="text-muted-foreground text-sm">Enter a new name for your Block</p> <form>`);

									Input($$renderer, {
										placeholder: 'Enter new Block name',
										class: 'my-4',
										get value() {
											return new_name;
										},

										set value($$value) {
											new_name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'button',
													variant: 'outline',
													onclick: () => renaming = false,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													type: 'submit',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Rename`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</form>`);
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

			$$renderer.push(` <div class="sidebar-symbol svelte-ykqz1w"><header class="svelte-ykqz1w"><div class="name svelte-ykqz1w"><h3 class="svelte-ykqz1w">${$.escape(symbol.name)}</h3> `);

			if (foreign_page_types().length > 0) {
				$$renderer.push('<!--[0-->');

				if (Tooltip.Provider) {
					$$renderer.push('<!--[-->');

					Tooltip.Provider($$renderer, {
						children: ($$renderer) => {
							if (Tooltip.Root) {
								$$renderer.push('<!--[-->');

								Tooltip.Root($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Trigger) {
											$$renderer.push('<!--[-->');

											Tooltip.Trigger($$renderer, {
												children: ($$renderer) => {
													Badge($$renderer, {
														variant: toggled ? 'destructive' : 'secondary',
														class: 'ml-2',
														children: ($$renderer) => {
															if (toggled) {
																$$renderer.push('<!--[0-->');
																Unlink($$renderer, { class: 'w-3 h-3' });
																$$renderer.push(`<!----> <span class="ml-1">Foreign Page Field</span>`);
															} else {
																$$renderer.push('<!--[-1-->');
																Unlink($$renderer, { class: 'w-3 h-3' });
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Content) {
											$$renderer.push('<!--[-->');

											Tooltip.Content($$renderer, {
												side: 'top',
												align: 'start',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(foreign_chip_title())}`);
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
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (controls_enabled) {
				$$renderer.push('<!--[0-->');
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (controls_enabled) {
				$$renderer.push(`<!--[0--><div class="symbol-options svelte-ykqz1w">`);

				if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)) {
					$$renderer.push(`<!--[0--><div class="overlay-actions svelte-ykqz1w"><button class="svelte-ykqz1w">`);
					Icon($$renderer, { icon: 'material-symbols:code' });
					$$renderer.push(`<!----></button> <button class="svelte-ykqz1w">`);
					Icon($$renderer, { icon: 'material-symbols:download' });
					$$renderer.push(`<!----></button> <button class="svelte-ykqz1w">`);
					Icon($$renderer, { icon: 'material-symbols:edit' });
					$$renderer.push(`<!----></button> <button class="delete svelte-ykqz1w">`);
					Icon($$renderer, { icon: 'ic:outline-delete' });
					$$renderer.push(`<!----></button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');

					if (show_toggle) {
						$$renderer.push('<!--[0-->');

						Toggle($$renderer, {
							label: 'Toggle Symbol for Page Type',
							disabled: !!component_error,
							hideLabel: true,
							toggled,
							small: true
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					MenuPopup($$renderer, {
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
									new_name = symbol.name;
									renaming = true;
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

					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></header> <div${$.attr_class('symbol-container svelte-ykqz1w', void 0, { 'disabled': component_error })}${$.attr('data-test-id', `symbol-${$.stringify(symbol.id)}`)}>`);

			if (component_error) {
				$$renderer.push(`<!--[0--><div class="error svelte-ykqz1w"></div>`);
			} else if (is_loading) {
				$$renderer.push(`<!--[1--><div class="loading svelte-ykqz1w">`);
				Icon($$renderer, { icon: 'eos-icons:three-dots-loading' });
				$$renderer.push(`<!----></div>`);
			} else if (componentCode) {
				$$renderer.push(`<!--[2--><!--[-->`);

				const each_array = $.ensure_array_like(related_activities());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [activity] = each_array[$$index];

					$$renderer.push(`<div class="absolute z-10 bg-[#222] p-1 right-0 top-0 rounded-bl-lg flex justify-center -space-x-1">`);

					if (Avatar.Root) {
						$$renderer.push('<!--[-->');

						Avatar.Root($$renderer, {
							class: 'ring-background ring-2 size-5',
							children: ($$renderer) => {
								if (activity.user_avatar) {
									$$renderer.push('<!--[0-->');

									if (Avatar.Image) {
										$$renderer.push('<!--[-->');

										Avatar.Image($$renderer, {
											src: activity.user_avatar,
											alt: activity.user.name || activity.user.email,
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
											$$renderer.push(`<!---->${$.escape((activity.user.name || activity.user.email).slice(0, 2).toUpperCase())}`);
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

					$$renderer.push(`</div>`);
				}

				$$renderer.push(`<!--]--> <div class="symbol svelte-ykqz1w">`);

				IFrame($$renderer, {
					head,
					componentCode,
					get height() {
						return height;
					},

					set height($$value) {
						height = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}