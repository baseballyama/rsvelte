import 'svelte/internal/disclose-version';
import { writable, get } from 'svelte/store';
import * as $ from 'svelte/internal/client';
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

const orientation = writable('horizontal');
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <main class="svelte-1u89jp2"><!></main>`, 1);

export default function BlockEditor($$anchor, $$props) {
	$.push($$props, true);

	const $locale = () => $.store_get(locale, '$locale', $$stores);
	const $has_error = () => $.store_get(has_error, '$has_error', $$stores);
	const $orientation = () => $.store_get(orientation, '$orientation', $$stores);
	const $refresh_preview = () => $.store_get(refresh_preview, '$refresh_preview', $$stores);
	const $site_html = () => $.store_get(site_html, '$site_html', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	hide_page_field_field_type_context.set(false);

	let tab = $.prop($$props, 'tab', 15, 'code'),
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

	if ($$props.block && $$props.symbol_type === 'site') {
		setUserActivity({ site_symbol: $$props.block.id });
	}

	// Choose the right collections based on symbol type
	const SymbolCollection = $.derived(() => $$props.symbol_type === 'library' ? LibrarySymbols : SiteSymbols);

	const FieldCollection = $.derived(() => $$props.symbol_type === 'library' ? LibrarySymbolFields : SiteSymbolFields);
	const EntryCollection = $.derived(() => $$props.symbol_type === 'library' ? LibrarySymbolEntries : SiteSymbolEntries);
	const { value: site } = site_context.getOr({ value: null });
	const active_symbol_group_id = $.derived(() => page.url.searchParams.get('group'));

	const active_symbol_group = $.derived(() => $$props.symbol_type === 'library' && $.get(active_symbol_group_id)
		? LibrarySymbolGroups.one($.get(active_symbol_group_id))
		: undefined);

	const new_block = () => {
		if ($$props.symbol_type === 'library') {
			if (!$.get(active_symbol_group)) {
				throw new Error('Symbol group not loaded');
			}

			return LibrarySymbols.create({
				css: '',
				html: '',
				js: '',
				name: '',
				group: $.get(active_symbol_group).id
			});
		} else {
			if (!site) {
				throw new Error('Site not loaded');
			}

			return SiteSymbols.create({ css: '', html: '', js: '', name: '', site: site.id });
		}
	};

	const block = $.proxy($$props.block ?? new_block());
	const fields = $.derived(() => 'site' in block ? block.fields() : block.fields());
	const entries = $.derived(() => 'site' in block ? block.entries() : block.entries());
	const data = $.derived(() => useContent(block, { target: 'cms' }));
	const component_data = $.derived(() => $.get(data) && ($.get(data)[$locale()] ?? {}));
	let loading = $.state(false);

	beforeNavigate((nav) => {
		if (has_unsaved_changes()) {
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
		tab(tab() === 'code' ? 'content' : 'code');
	}

	async function save_component() {
		if (!$has_error()) {
			$.set(loading, true);

			// Update symbol code (doing this here to prevent compilation for the symbol in the sidebar/background
			$.get(SymbolCollection).update(block.id, { html: $.get(html), css: $.get(css), js: $.get(js) });

			await self.commit();

			// Reset baselines after successful save
			$.set(initial_code, { html: $.get(html), css: $.get(css), js: $.get(js) }, true);

			$.set(initial_data, _.cloneDeep($.get(component_data)), true);
			has_unsaved_changes(false);
			$.set(loading, false);
			header().button.onclick(block);
		}
	}

	let html = $.state($.proxy(block.html));
	let css = $.state($.proxy(block.css));
	let js = $.state($.proxy(block.js));

	// Store initial data for comparison
	let initial_code = $.state($.proxy({ html: block.html, css: block.css, js: block.js }));

	let initial_data = $.state($.proxy(_.cloneDeep($.get(component_data))));

	// Compare current state to initial data (explicit watch)
	watch(() => [$.get(html), $.get(css), $.get(js), $.get(component_data)], () => {
		const code_changed = $.get(html) !== $.get(initial_code).html || $.get(css) !== $.get(initial_code).css || $.get(js) !== $.get(initial_code).js;
		const data_changed = !_.isEqual($.get(initial_data), $.get(component_data));

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
		let $0 = $.derived(() => block.name || 'Block');

		let $1 = $.derived(() => ({
			...header().button,
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
				icon: 'lucide:cuboid',
				get button() {
					return $.get($1);
				},

				children: ($$anchor, $$slotProps) => {
					LargeSwitch($$anchor, {
						get active_tab_id() {
							return tab();
						},

						set active_tab_id($$value) {
							tab($$value);
						}
					});
				},
				$$slots: { default: true }
			});
		});
	}

	var main = $.sibling(node, 2);
	var node_1 = $.child(main);

	PaneGroup(node_1, {
		get direction() {
			return $orientation();
		},
		class: 'flex',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			Pane(node_2, {
				defaultSize: 50,
				class: 'p-1',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_3 = $.first_child(fragment_3);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => block?.id);

								FullCodeEditor($$anchor, {
									get data() {
										return $.get(component_data);
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

						var consequent_1 = ($$anchor) => {
							Fields($$anchor, {
								get entity() {
									return block;
								},

								get fields() {
									return $.get(fields);
								},

								get entries() {
									return $.get(entries);
								},

								create_field: async (data) => {
									// Get the highest index for fields at this level
									const siblingFields = ($.get(fields) ?? []).filter((f) => data?.parent ? f.parent === data.parent : !f.parent);

									const nextIndex = Math.max(...siblingFields.map((f) => f.index || 0), -1) + 1;

									$.get(FieldCollection).create({
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
										fields: $.get(fields),
										entries: $.get(entries),
										updateEntry: $.get(EntryCollection).update,
										createEntry: $.get(EntryCollection).create,
										values
									});
								},

								onchange: ({ id, data }) => {
									$.get(FieldCollection).update(id, data);
								},

								ondelete: (field) => {
									$.get(FieldCollection).delete(field.id);
								},

								ondelete_entry: (entry_id) => {
									$.get(EntryCollection).delete(entry_id);
								}
							});
						};

						$.if(node_3, ($$render) => {
							if (tab() === 'code') $$render(consequent); else if (tab() === 'content' && $.get(fields)) $$render(consequent_1, 1);
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			PaneResizer(node_4, { class: 'PaneResizer' });

			var node_5 = $.sibling(node_4, 2);

			Pane(node_5, {
				defaultSize: 50,
				children: ($$anchor, $$slotProps) => {
					ComponentPreview($$anchor, {
						get id() {
							return block.id;
						},
						view: 'small',
						get loading() {
							return $.get(loading);
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
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(main);
	$.template_effect(() => $.set_attribute(main, 'lang', $locale()));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}