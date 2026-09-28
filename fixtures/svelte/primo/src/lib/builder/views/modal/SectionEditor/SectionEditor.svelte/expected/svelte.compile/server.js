import * as $ from 'svelte/internal/server';
import * as Dialog from '$lib/components/ui/dialog';
import { PaneGroup, Pane, PaneResizer } from 'paneforge';
import LargeSwitch from '../../../ui/LargeSwitch.svelte';
import FullCodeEditor from './FullCodeEditor.svelte';
import ComponentPreview, { refresh_preview, has_error } from '$lib/builder/components/ComponentPreview.svelte';
import Fields, { setFieldEntries } from '../../../components/Fields/FieldsContent.svelte';
import { locale } from '../../../stores/app/misc.js';
import { site_html } from '$lib/builder/stores/app/page.js';
import { watch } from 'runed';
import { onModKey } from '$lib/builder/utils/keyboard';
import { browser } from '$app/environment';

import {
	PageSectionEntries,
	PageSections,
	PageEntries,
	PageTypeSectionEntries,
	SiteSymbolFields,
	SiteSymbols,
	SiteSymbolEntries,
	SiteEntries,
	Sites
} from '$lib/pocketbase/collections';

import { current_user } from '$lib/pocketbase/user';
import * as _ from 'lodash-es';
import { useContent } from '$lib/Content.svelte';
import { self } from '$lib/pocketbase/managers';
import { beforeNavigate } from '$app/navigation';
import { setUserActivity } from '$lib/UserActivity.svelte';
import { writable } from 'svelte/store';

const orientation = writable('horizontal');

export default function SectionEditor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			component,
			tab = 'content',
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
			}
		} = $$props;

		setUserActivity('page_type' in component
			? { page_type_section: component.id }
			: { page_section: component.id });

		// Data will be loaded automatically by CollectionMapping system when accessed
		const symbol = $.derived(() => SiteSymbols.one(component.symbol));

		const fields = $.derived(() => symbol()?.fields());

		const entries = $.derived(() => 'page_type' in component
			? component.entries()
			: 'page' in component ? component.entries() : undefined);

		const data = $.derived(() => useContent(component, { target: 'cms' }));
		const component_data = $.derived(() => data() && (data()[$.store_get($$store_subs ??= {}, '$locale', locale)] ?? {}));
		const initial_code = { html: symbol()?.html, css: symbol()?.css, js: symbol()?.js };
		const initial_data = _.cloneDeep(component_data());
		let loading = false;
		let newly_created_fields = new Set();

		// Create completions array in field order for autocomplete
		const completions = $.derived(() => fields() && component_data()
			? fields().filter((field) => field.key && component_data().hasOwnProperty(field.key)).sort((a, b) => (a.index || 0) - (b.index || 0)).map((field, index) => {
				const value = component_data()[field.key];

				const detail = Array.isArray(value)
					? `[ ${typeof value[0]} ]`
					: typeof value === 'object' && value !== null
						? '{ ' + Object.entries(value).map(([key, val]) => `${key}:${typeof val}`).join(', ') + ' }'
						: typeof value;

				return {
					label: field.key,
					type: 'variable',
					detail,
					boost: 100 - index, // Higher boost for earlier fields (maintains order)
					apply: (view, completion, from, to) => {
						// Check if there's already a closing bracket after the cursor
						const afterCursor = view.state.doc.sliceString(to, to + 1);

						const insert = field.key + (afterCursor === '}' ? '' : '}');

						view.dispatch({ changes: { from, to, insert } });
					}
				};
			})
			: []);

		beforeNavigate((nav) => {
			if (has_unsaved_changes) {
				// Prevent navigation when there are unsaved changes
				nav.cancel();

				alert('You have unsaved changes. Please save before navigating away.');
			}
		});

		// Set up hotkey listeners for modal (global fallback)
		onModKey('e', toggle_tab);

		// Save component
		onModKey('s', save_component);

		function toggle_tab() {
			if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole !== 'developer') {
				return;
			}

			tab = tab === 'code' ? 'content' : 'code';
		}

		async function save_component() {
			// if (!$preview_updated) {
			// 	await refresh_preview()
			// }
			if (!$.store_get($$store_subs ??= {}, '$has_error', has_error) && symbol()) {
				loading = true;

				// Update symbol code (doing this here to prevent compilation for the symbol in the sidebar/background
				SiteSymbols.update(symbol().id, { html, css, js });

				// Copy entries for newly created fields to the symbol
				if (newly_created_fields.size > 0 && entries()) {
					for (const fieldId of newly_created_fields) {
						// Find entries for this field in the section (only top-level entries for now)
						const fieldEntries = entries().filter((e) => e.field === fieldId && !e.parent);

						// Copy each entry to the symbol (newly created fields won't have symbol entries yet)
						for (const entry of fieldEntries) {
							SiteSymbolEntries.create({
								field: entry.field,
								locale: entry.locale,
								value: entry.value,
								index: entry.index

								// Note: not copying parent relationships for now as that would require complex mapping
							});
						}
					}

					// Clear the set after copying
					newly_created_fields.clear();
				}

				SiteSymbols.update(symbol().id, { html, css, js });
				await self.commit();
				loading = false;
				header.button.onclick();
			}
		}

		let html = symbol()?.html ?? '';
		let css = symbol()?.css ?? '';
		let js = symbol()?.js ?? '';

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
					title: symbol()?.name || 'Section',
					icon: 'tabler:section-filled',
					button: {
						label: header.button.label || 'Save',
						hint: '⌘S',
						loading,
						onclick: save_component,
						disabled: $.store_get($$store_subs ??= {}, '$has_error', has_error) || loading
					},

					children: ($$renderer) => {
						if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
							$$renderer.push('<!--[0-->');

							LargeSwitch($$renderer, {
								get active_tab_id() {
									return tab;
								},

								set active_tab_id($$value) {
									tab = $$value;
									$$settled = false;
								}
							});
						} else {
							$$renderer.push('<!--[-1-->');
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

			$$renderer.push(` <main${$.attr('lang', $.store_get($$store_subs ??= {}, '$locale', locale))} class="svelte-11nn2v3">`);

			PaneGroup($$renderer, {
				direction: $.store_get($$store_subs ??= {}, '$orientation', orientation),
				class: 'flex gap-1',
				children: ($$renderer) => {
					Pane($$renderer, {
						defaultSize: 50,
						class: 'flex flex-col',
						children: ($$renderer) => {
							if (tab === 'code') {
								$$renderer.push('<!--[0-->');

								FullCodeEditor($$renderer, {
									data: component_data(),
									completions: completions(),
									storage_key: symbol()?.id,
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
							} else if (tab === 'content' && fields() && entries()) {
								$$renderer.push('<!--[1-->');

								Fields($$renderer, {
									entity: component,
									fields: fields(),
									entries: entries(),
									create_field: (data) => {
										if (!symbol()) {
											return;
										}

										// Get the highest index for fields at this level
										const siblingFields = (fields() ?? []).filter((f) => data?.parent ? f.parent === data.parent : !f.parent);

										const nextIndex = Math.max(...siblingFields.map((f) => f.index || 0), -1) + 1;

										const newField = SiteSymbolFields.create({
											type: 'text',
											key: '',
											label: '',
											config: null,
											symbol: symbol().id,
											...data,
											index: nextIndex
										});

										// Track this as a newly created field
										if (newField) {
											has_unsaved_changes = true;
											newly_created_fields.add(newField.id);
										}
									},

									oninput: (values) => {
										if ('page_type' in component) {
											setFieldEntries({
												fields: fields(),
												entries: entries(),
												updateEntry: PageTypeSectionEntries.update,
												createEntry: (data) => PageTypeSectionEntries.create({ ...data, section: component.id }),
												values
											});
										} else {
											setFieldEntries({
												fields: fields(),
												entries: entries(),
												updateEntry: PageSectionEntries.update,
												createEntry: (data) => PageSectionEntries.create({ ...data, section: component.id }),
												values
											});
										}
									},

									onchange: ({ id, data }) => {
										SiteSymbolFields.update(id, data);
									},

									ondelete: (field) => {
										SiteSymbolFields.delete(field.id);
									},

									ondelete_entry: (entry_id) => {
										if ('page_type' in component) {
											PageTypeSectionEntries.delete(entry_id);
										} else {
											PageSectionEntries.delete(entry_id);
										}
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
								id: symbol()?.id,
								code: code(),
								data: component_data(),
								fields: fields(),
								view: 'small',
								loading,
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