import 'svelte/internal/disclose-version';
import { writable } from 'svelte/store';
import * as $ from 'svelte/internal/client';
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

const orientation = writable('horizontal');
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <main class="svelte-11nn2v3"><!></main>`, 1);

export default function SectionEditor($$anchor, $$props) {
	$.push($$props, true);

	const $locale = () => $.store_get(locale, '$locale', $$stores);
	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const $has_error = () => $.store_get(has_error, '$has_error', $$stores);
	const $orientation = () => $.store_get(orientation, '$orientation', $$stores);
	const $refresh_preview = () => $.store_get(refresh_preview, '$refresh_preview', $$stores);
	const $site_html = () => $.store_get(site_html, '$site_html', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let tab = $.prop($$props, 'tab', 15, 'content'),
		has_unsaved_changes = $.prop($$props, 'has_unsaved_changes', 15, false),
		header = $.prop($$props, 'header', 19, () => ({
			label: 'Create Component',
			icon: 'fas fa-code',
			button: {
				icon: 'fas fa-plus',
				label: 'Add to page',
				onclick: (component) => {
					console.warn('Component not going anywhere', component);
				}
			}
		}));

	setUserActivity('page_type' in $$props.component
		? { page_type_section: $$props.component.id }
		: { page_section: $$props.component.id });

	// Data will be loaded automatically by CollectionMapping system when accessed
	const symbol = $.derived(() => SiteSymbols.one($$props.component.symbol));

	const fields = $.derived(() => $.get(symbol)?.fields());

	const entries = $.derived(() => 'page_type' in $$props.component
		? $$props.component.entries()
		: 'page' in $$props.component ? $$props.component.entries() : undefined);

	const data = $.derived(() => useContent($$props.component, { target: 'cms' }));
	const component_data = $.derived(() => $.get(data) && ($.get(data)[$locale()] ?? {}));

	const initial_code = $.proxy({
		html: $.get(symbol)?.html,
		css: $.get(symbol)?.css,
		js: $.get(symbol)?.js
	});

	const initial_data = $.proxy(_.cloneDeep($.get(component_data)));
	let loading = $.state(false);
	let newly_created_fields = new Set();

	// Create completions array in field order for autocomplete
	const completions = $.derived(() => $.get(fields) && $.get(component_data)
		? $.get(fields).filter((field) => field.key && $.get(component_data).hasOwnProperty(field.key)).sort((a, b) => (a.index || 0) - (b.index || 0)).map((field, index) => {
			const value = $.get(component_data)[field.key];

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
		if (has_unsaved_changes()) {
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
		if ($current_user()?.siteRole !== 'developer') {
			return;
		}

		tab(tab() === 'code' ? 'content' : 'code');
	}

	async function save_component() {
		// if (!$preview_updated) {
		// 	await refresh_preview()
		// }
		if (!$has_error() && $.get(symbol)) {
			$.set(loading, true);

			// Update symbol code (doing this here to prevent compilation for the symbol in the sidebar/background
			SiteSymbols.update($.get(symbol).id, { html: $.get(html), css: $.get(css), js: $.get(js) });

			// Copy entries for newly created fields to the symbol
			if (newly_created_fields.size > 0 && $.get(entries)) {
				for (const fieldId of newly_created_fields) {
					// Find entries for this field in the section (only top-level entries for now)
					const fieldEntries = $.get(entries).filter((e) => e.field === fieldId && !e.parent);

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

			SiteSymbols.update($.get(symbol).id, { html: $.get(html), css: $.get(css), js: $.get(js) });
			await self.commit();
			$.set(loading, false);
			header().button.onclick();
		}
	}

	let html = $.state($.proxy($.get(symbol)?.html ?? ''));
	let css = $.state($.proxy($.get(symbol)?.css ?? ''));
	let js = $.state($.proxy($.get(symbol)?.js ?? ''));

	// Compare current state to initial data (explicit watch)
	watch(() => [$.get(html), $.get(css), $.get(js), $.get(component_data)], () => {
		const code_changed = $.get(html) !== initial_code.html || $.get(css) !== initial_code.css || $.get(js) !== initial_code.js;
		const data_changed = !_.isEqual(initial_data, $.get(component_data));

		has_unsaved_changes(code_changed || data_changed);
	});

	// Add beforeunload listener via effect (lifecycle)
	$.user_effect(() => {
		if (!browser) return;
		if (!has_unsaved_changes()) return;

		const handleBeforeUnload = (e) => {
			e.preventDefault();
			e.returnValue = '';

			return '';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	});

	// Create code object for ComponentPreview)
	let code = $.derived(() => ({
		html: $.get(html) || '<!-- Add your HTML here -->',
		css: $.get(css) || '/* Add your CSS here */',
		js: $.get(js) || ''
	}));

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => $.get(symbol)?.name || 'Section');

		let $1 = $.derived(() => ({
			label: header().button.label || 'Save',
			hint: '⌘S',
			loading: $.get(loading),
			onclick: save_component,
			disabled: $has_error() || $.get(loading)
		}));

		$.component(node, () => Dialog.Header, ($$anchor, Dialog_Header) => {
			Dialog_Header($$anchor, {
				get title() {
					return $.get($0);
				},
				icon: 'tabler:section-filled',
				get button() {
					return $.get($1);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							LargeSwitch($$anchor, {
								get active_tab_id() {
									return tab();
								},

								set active_tab_id($$value) {
									tab($$value);
								}
							});
						};

						$.if(node_1, ($$render) => {
							if ($current_user()?.siteRole === 'developer') $$render(consequent);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	var main = $.sibling(node, 2);
	var node_2 = $.child(main);

	PaneGroup(node_2, {
		get direction() {
			return $orientation();
		},
		class: 'flex gap-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_3 = $.first_child(fragment_3);

			Pane(node_3, {
				defaultSize: 50,
				class: 'flex flex-col',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_4 = $.first_child(fragment_4);

					{
						var consequent_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(symbol)?.id);

								FullCodeEditor($$anchor, {
									get data() {
										return $.get(component_data);
									},

									get completions() {
										return $.get(completions);
									},

									get storage_key() {
										return $.get($0);
									},

									get html() {
										return $.get(html);
									},

									set html($$value) {
										$.set(html, $$value, true);
									},

									get css() {
										return $.get(css);
									},

									set css($$value) {
										$.set(css, $$value, true);
									},

									get js() {
										return $.get(js);
									},

									set js($$value) {
										$.set(js, $$value, true);
									},

									$$events: {
										save: save_component,
										'mod-e': toggle_tab,
										'mod-r': () => $refresh_preview()()
									}
								});
							}
						};

						var consequent_2 = ($$anchor) => {
							Fields($$anchor, {
								get entity() {
									return $$props.component;
								},

								get fields() {
									return $.get(fields);
								},

								get entries() {
									return $.get(entries);
								},

								create_field: (data) => {
									if (!$.get(symbol)) {
										return;
									}

									// Get the highest index for fields at this level
									const siblingFields = ($.get(fields) ?? []).filter((f) => data?.parent ? f.parent === data.parent : !f.parent);

									const nextIndex = Math.max(...siblingFields.map((f) => f.index || 0), -1) + 1;

									const newField = SiteSymbolFields.create({
										type: 'text',
										key: '',
										label: '',
										config: null,
										symbol: $.get(symbol).id,
										...data,
										index: nextIndex
									});

									// Track this as a newly created field
									if (newField) {
										has_unsaved_changes(true);
										newly_created_fields.add(newField.id);
									}
								},

								oninput: (values) => {
									if ('page_type' in $$props.component) {
										setFieldEntries({
											fields: $.get(fields),
											entries: $.get(entries),
											updateEntry: PageTypeSectionEntries.update,
											createEntry: (data) => PageTypeSectionEntries.create({ ...data, section: $$props.component.id }),
											values
										});
									} else {
										setFieldEntries({
											fields: $.get(fields),
											entries: $.get(entries),
											updateEntry: PageSectionEntries.update,
											createEntry: (data) => PageSectionEntries.create({ ...data, section: $$props.component.id }),
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
									if ('page_type' in $$props.component) {
										PageTypeSectionEntries.delete(entry_id);
									} else {
										PageSectionEntries.delete(entry_id);
									}
								}
							});
						};

						$.if(node_4, ($$render) => {
							if (tab() === 'code') $$render(consequent_1); else if (tab() === 'content' && $.get(fields) && $.get(entries)) $$render(consequent_2, 1);
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_3, 2);

			PaneResizer(node_5, { class: 'PaneResizer' });

			var node_6 = $.sibling(node_5, 2);

			Pane(node_6, {
				defaultSize: 50,
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => $.get(symbol)?.id);

						ComponentPreview($$anchor, {
							get id() {
								return $.get($0);
							},

							get code() {
								return $.get(code);
							},

							get data() {
								return $.get(component_data);
							},

							get fields() {
								return $.get(fields);
							},
							view: 'small',
							get loading() {
								return $.get(loading);
							},

							get head() {
								return $site_html();
							},

							get orientation() {
								$.mark_store_binding();

								return $orientation();
							},

							set orientation($$value) {
								$.store_set(orientation, $$value);
							}
						});
					}
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(main);
	$.template_effect(() => $.set_attribute(main, 'lang', $locale()));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}