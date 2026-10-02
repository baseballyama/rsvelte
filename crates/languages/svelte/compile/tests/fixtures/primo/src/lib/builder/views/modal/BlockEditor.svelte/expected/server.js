import * as $ from 'svelte/internal/server';
import * as Dialog from '$lib/components/ui/dialog';
import LargeSwitch from '$lib/builder/ui/LargeSwitch.svelte';
import { PaneGroup, Pane, PaneResizer } from 'paneforge';
import FullCodeEditor from './SectionEditor/FullCodeEditor.svelte';
import ComponentPreview, { has_error, refresh_preview } from '$lib/builder/components/ComponentPreview.svelte';
import Fields, { setFieldEntries } from '$lib/builder/components/Fields/FieldsContent.svelte';
import { locale } from '$lib/builder/stores/app/misc.js';
import { watch } from 'runed';
import { onModKey } from '$lib/builder/utils/keyboard';

import {
	LibrarySymbolEntries,
	LibrarySymbolFields,
	LibrarySymbolGroups,
	LibrarySymbols,
	SiteSymbolEntries,
	SiteSymbolFields,
	SiteSymbols
} from '$lib/pocketbase/collections';

import { page } from '$app/state';
import { browser } from '$app/environment';
import _ from 'lodash-es';
import { site_context, hide_page_field_field_type_context } from '$lib/builder/stores/context';
import { site_html } from '$lib/builder/stores/app/page.js';
import { useContent } from '$lib/Content.svelte';
import { self } from '$lib/pocketbase/managers';
import { beforeNavigate } from '$app/navigation';
import { setUserActivity } from '$lib/UserActivity.svelte';
import { writable, get } from 'svelte/store';

const orientation = writable('horizontal');

export default function BlockEditor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		hide_page_field_field_type_context.set(false);

		let {
			block: existing_block,
			tab = 'code',
			has_unsaved_changes = false,
			header = {
				label: 'Create Component',
				icon: 'fas fa-code',
				button: {
					icon: 'fas fa-plus',
					label: 'Add to page',
					onclick: (component) => {
						console.warn('Component not going anywhere', component);
					}
				}
			},
			symbol_type
		} = $$props;

		if (existing_block && symbol_type === 'site') {
			setUserActivity({ site_symbol: existing_block.id });
		}

		// Choose the right collections based on symbol type
		const SymbolCollection = $.derived(() => symbol_type === 'library' ? LibrarySymbols : SiteSymbols);

		const FieldCollection = $.derived(() => symbol_type === 'library' ? LibrarySymbolFields : SiteSymbolFields);
		const EntryCollection = $.derived(() => symbol_type === 'library' ? LibrarySymbolEntries : SiteSymbolEntries);
		const { value: site } = site_context.getOr({ value: null });
		const active_symbol_group_id = $.derived(() => page.url.searchParams.get('group'));

		const active_symbol_group = $.derived(() => symbol_type === 'library' && active_symbol_group_id()
			? LibrarySymbolGroups.one(active_symbol_group_id())
			: undefined);

		const new_block = () => {
			if (symbol_type === 'library') {
				if (!active_symbol_group()) {
					throw new Error('Symbol group not loaded');
				}

				return LibrarySymbols.create({
					css: '',
					html: '',
					js: '',
					name: '',
					group: active_symbol_group().id
				});
			} else {
				if (!site) {
					throw new Error('Site not loaded');
				}

				return SiteSymbols.create({ css: '', html: '', js: '', name: '', site: site.id });
			}
		};

		const block = existing_block ?? new_block();
		const fields = $.derived(() => 'site' in block ? block.fields() : block.fields());
		const entries = $.derived(() => 'site' in block ? block.entries() : block.entries());
		const data = $.derived(() => useContent(block, { target: 'cms' }));
		const component_data = $.derived(() => data() && (data()[$.store_get($$store_subs ??= {}, '$locale', locale)] ?? {}));
		let loading = false;

		beforeNavigate((nav) => {
			if (has_unsaved_changes) {
				// Prevent navigation when there are unsaved changes
				nav.cancel();

				alert('You have unsaved changes. Please save before navigating away.');
			}
		});

		// Set up hotkey listeners for modal
		onModKey('e', toggle_tab);

		// Save component
		onModKey('s', save_component);

		function toggle_tab() {
			tab = tab === 'code' ? 'content' : 'code';
		}

		async function save_component() {
			if (!$.store_get($$store_subs ??= {}, '$has_error', has_error)) {
				loading = true;

				// Update symbol code (doing this here to prevent compilation for the symbol in the sidebar/background
				SymbolCollection().update(block.id, { html, css, js });

				await self.commit();

				// Reset baselines after successful save
				initial_code = { html, css, js };

				initial_data = _.cloneDeep(component_data());
				has_unsaved_changes = false;
				loading = false;
				header.button.onclick(block);
			}
		}

		let html = block.html;
		let css = block.css;
		let js = block.js;

		// Store initial data for comparison
		let initial_code = { html: block.html, css: block.css, js: block.js };

		let initial_data = _.cloneDeep(component_data());

		// Compare current state to initial data (explicit watch)
		watch(() => [html, css, js, component_data()], () => {
			const code_changed = html !== initial_code.html || css !== initial_code.css || js !== initial_code.js;
			const data_changed = !_.isEqual(initial_data, component_data());

			has_unsaved_changes = code_changed || data_changed;
		});

		// Add beforeunload listener via effect (lifecycle)
		// Create code object for ComponentPreview)
		let code = $.derived(() => ({
			html: html || '<!-- Add your HTML here -->',
			css: css || '/* Add your CSS here */',
			js: js || ''
		}));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Header) {
				$$renderer.push('<!--[-->');

				Dialog.Header($$renderer, {
					title: block.name || 'Block',
					icon: 'lucide:cuboid',
					button: {
						...header.button,
						hint: '⌘S',
						loading,
						onclick: save_component,
						disabled: $.store_get($$store_subs ??= {}, '$has_error', has_error) || loading
					},

					children: ($$renderer) => {
						LargeSwitch($$renderer, {
							get active_tab_id() {
								return tab;
							},

							set active_tab_id($$value) {
								tab = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <main${$.attr('lang', $.store_get($$store_subs ??= {}, '$locale', locale))} class="svelte-1u89jp2">`);

			PaneGroup($$renderer, {
				direction: $.store_get($$store_subs ??= {}, '$orientation', orientation),
				class: 'flex',
				children: ($$renderer) => {
					Pane($$renderer, {
						defaultSize: 50,
						class: 'p-1',
						children: ($$renderer) => {
							if (tab === 'code') {
								$$renderer.push('<!--[0-->');

								FullCodeEditor($$renderer, {
									data: component_data(),
									storage_key: block?.id,
									get html() {
										return html;
									},

									set html($$value) {
										html = $$value;
										$$settled = false;
									},

									get css() {
										return css;
									},

									set css($$value) {
										css = $$value;
										$$settled = false;
									},

									get js() {
										return js;
									},

									set js($$value) {
										js = $$value;
										$$settled = false;
									}
								});
							} else if (tab === 'content' && fields()) {
								$$renderer.push('<!--[1-->');

								Fields($$renderer, {
									entity: block,
									fields: fields(),
									entries: entries(),
									create_field: async (data) => {
										// Get the highest index for fields at this level
										const siblingFields = (fields() ?? []).filter((f) => data?.parent ? f.parent === data.parent : !f.parent);

										const nextIndex = Math.max(...siblingFields.map((f) => f.index || 0), -1) + 1;

										FieldCollection().create({
											type: 'text',
											key: '',
											label: '',
											config: null,
											symbol: block.id,
											...data,
											index: nextIndex
										});
									},

									oninput: (values) => {
										setFieldEntries({
											fields: fields(),
											entries: entries(),
											updateEntry: EntryCollection().update,
											createEntry: EntryCollection().create,
											values
										});
									},

									onchange: ({ id, data }) => {
										FieldCollection().update(id, data);
									},

									ondelete: (field) => {
										FieldCollection().delete(field.id);
									},

									ondelete_entry: (entry_id) => {
										EntryCollection().delete(entry_id);
									}
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					PaneResizer($$renderer, { class: 'PaneResizer' });
					$$renderer.push(`<!----> `);

					Pane($$renderer, {
						defaultSize: 50,
						children: ($$renderer) => {
							ComponentPreview($$renderer, {
								id: block.id,
								view: 'small',
								loading,
								code: code(),
								data: component_data(),
								fields: fields(),
								head: $.store_get($$store_subs ??= {}, '$site_html', site_html),
								get orientation() {
									return $.store_get($$store_subs ??= {}, '$orientation', orientation);
								},

								set orientation($$value) {
									$.store_set(orientation, $$value);
									$$settled = false;
								}
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { tab, has_unsaved_changes });
	});
}