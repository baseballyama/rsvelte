import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';
import * as _ from 'lodash-es';
import { watch } from 'runed';
import FieldItem from './FieldItem.svelte';
import { fieldTypes } from '../../stores/app/index.js';
import { mod_key_held, field_tabs_by_entity } from '../../stores/app/misc.js';
import EntryContent from './EntryContent.svelte';
import { current_user } from '$lib/pocketbase/user';

export function setFieldEntries(options) {
	const { fields, entries, updateEntry, createEntry, values, parent } = options;

	for (const [key, items] of Object.entries(values)) {
		for (const index in items) {
			const field = fields?.find((field) => field.key === key && (parent ? field.parent === parent?.field : !field.parent));

			if (!field) {
				continue;
			}

			let entry = entries?.find((entry) => entry.field === field?.id && (parent ? entry.parent === parent?.id : !entry.parent) && entry.index === +index);

			if (entry) {
				entry = updateEntry(entry.id, { value: items[index].value });
			} else {
				entry = createEntry({
					field: field.id,
					parent: parent?.id,
					index: +index,
					locale: 'en',
					value: items[index].value
				});
			}

			if (items[index].subValues) {
				setFieldEntries({ ...options, values: items[index].subValues, parent: entry });
			}
		}
	}
}

var root = $.from_html(`<span class="key-hint svelte-fzf0fs"><span>&#8984;</span> <!></span>`);
var root_1 = $.from_html(`<span>Entries</span>`);
var root_2 = $.from_html(`<span>Entry</span>`);
var root_3 = $.from_html(`<div class="top-tabs svelte-fzf0fs"><button data-test-id="field"><!> <span class="tab-content svelte-fzf0fs"><!> <span>Field</span></span></button> <button data-test-id="entry"><!> <span class="tab-content svelte-fzf0fs"><!> <!></span></button></div>`);
var root_4 = $.from_html(`<div class="FieldItem"><!></div>`);
var root_5 = $.from_html(`<div class="entries-item svelte-fzf0fs"><!> <div class="container svelte-fzf0fs"><!></div></div>`);
var root_6 = $.from_html(`<button class="field-button svelte-fzf0fs"><!> <span>Create Field</span></button>`);
var root_7 = $.from_html(`<div class="Fields svelte-fzf0fs"><!> <!></div>`);

export default function FieldsContent($$anchor, $$props) {
	$.push($$props, true);

	const $field_tabs_by_entity = () => $.store_get(field_tabs_by_entity, '$field_tabs_by_entity', $$stores);
	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const $fieldTypes = () => $.store_get(fieldTypes, '$fieldTypes', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// TABS - Simple persistent approach
	let selected_tabs = $.proxy($field_tabs_by_entity()?.[$$props.entity?.id] || {});

	// Track field IDs to detect newly created fields
	const current_field_ids = () => ($$props.fields || []).filter((f) => !f.parent || f.parent === '').map((f) => f.id);

	let previous_field_ids = $.state($.proxy(current_field_ids()));

	// Initialize tabs for new fields when they appear, using an explicit watch
	watch(current_field_ids, (parent_field_ids) => {
		let changed = false;

		for (const id of parent_field_ids) {
			if (!(id in selected_tabs)) {
				// If this is a newly created field (not in previous list), show field tab
				// Otherwise, show entry tab by default for existing fields
				const is_new_field = !$.get(previous_field_ids).includes(id);

				selected_tabs[id] = is_new_field && $current_user()?.siteRole === 'developer' ? 'field' : 'entry';
				changed = true;
			}
		}

		$.set(previous_field_ids, [...parent_field_ids], true);

		if (changed) persist_tabs();
	});

	function select_tab(field_id, tab) {
		selected_tabs[field_id] = tab;
		persist_tabs();
	}

	function set_all_tabs(tab) {
		Object.keys(selected_tabs).forEach((field_id) => {
			selected_tabs[field_id] = tab;
		});

		persist_tabs();
	}

	function persist_tabs() {
		const entity_id = $$props.entity?.id;

		if (!entity_id) return;

		const current = $field_tabs_by_entity()?.[entity_id] || {};

		if (!_.isEqual(current, selected_tabs)) {
			$.store_set(field_tabs_by_entity, {
				...$field_tabs_by_entity(),
				[entity_id]: { ...selected_tabs }
			});
		}
	}

	// Field reordering function
	function move_field(field, direction) {
		// Get all top-level fields (same parent level as the field being moved)
		const siblings = $$props.fields.filter((f) => (f.parent || '') === (field.parent || ''));

		// Sort by index to get current order
		const sorted_siblings = siblings.sort((a, b) => (a.index || 0) - (b.index || 0));

		// Find current position
		const current_index = sorted_siblings.findIndex((f) => f.id === field.id);

		if (current_index === -1) return; // Field not found

		// Calculate new position
		let new_index = current_index;

		if (direction === 'up' && current_index > 0) {
			new_index = current_index - 1;
		} else if (direction === 'down' && current_index < sorted_siblings.length - 1) {
			new_index = current_index + 1;
		} else {
			return; // Can't move further in that direction
		}

		// Swap the fields - use the other field's current index value
		const field_to_swap = sorted_siblings[new_index];

		const temp_index = field.index || current_index;

		// Update the indices by swapping them
		$$props.onchange({
			id: field.id,
			data: { index: field_to_swap.index || new_index }
		});

		$$props.onchange({ id: field_to_swap.id, data: { index: temp_index } });
	}

	function duplicate_field(field) {
		$$props.create_field(field);
	}

	function delete_field_related_records(field_id) {
		// Delete sub-fields
		for (const field of $$props.fields) {
			if (field.parent === field_id) {
				delete_field_related_records(field.id);
				$$props.ondelete(field);
			}
		}

		// Delete all entries attached to the field.
		for (const entry of $$props.entries) {
			if (entry.field === field_id) {
				delete_entry_related_records(entry.id);
				$$props.ondelete_entry(entry.id);
			}
		}
	}

	function delete_entry_related_records(entry_id) {
		// Delete all sub-entries.
		for (const entry of $$props.entries) {
			if (entry.parent === entry_id) {
				delete_entry_related_records(entry.id);
				$$props.ondelete_entry(entry.id);
			}
		}
	}

	function handle_change(details) {
		if ('type' in details.data) {
			// Changing field type.
			delete_field_related_records(details.id);
		}

		$$props.onchange(details);
	}

	function handle_delete_field(field) {
		delete_field_related_records(field.id);
		$$props.ondelete(field);
	}

	function handle_delete_entry(entry_id) {
		delete_entry_related_records(entry_id);
		$$props.ondelete_entry(entry_id);
	}

	var div = root_7();
	var node = $.child(div);

	$.each(node, 17, () => ($$props.fields || []).filter((f) => !f.parent || f.parent === '').sort((a, b) => a.index - b.index), (field) => field.id, ($$anchor, field) => {
		const active_tab = $.derived(() => selected_tabs[$.get(field).id] ?? 'entry');
		var div_1 = root_5();
		var node_1 = $.child(div_1);

		{
			var consequent_3 = ($$anchor) => {
				var div_2 = root_3();
				var button = $.child(div_2);
				let classes;
				var node_2 = $.child(button);

				{
					var consequent = ($$anchor) => {
						var span = root();
						var node_3 = $.sibling($.child(span), 2);

						Icon(node_3, { icon: 'fa6-solid:hand-pointer' });
						$.reset(span);
						$.append($$anchor, span);
					};

					$.if(node_2, ($$render) => {
						if ($mod_key_held() && $.get(active_tab) !== 'field') $$render(consequent);
					});
				}

				var span_1 = $.sibling(node_2, 2);
				var node_4 = $.child(span_1);

				Icon(node_4, { icon: 'fluent:form-48-filled' });
				$.next(2);
				$.reset(span_1);
				$.reset(button);

				var button_1 = $.sibling(button, 2);
				let classes_1;
				var node_5 = $.child(button_1);

				{
					var consequent_1 = ($$anchor) => {
						var span_2 = root();
						var node_6 = $.sibling($.child(span_2), 2);

						Icon(node_6, { icon: 'fa6-solid:hand-pointer' });
						$.reset(span_2);
						$.append($$anchor, span_2);
					};

					$.if(node_5, ($$render) => {
						if ($mod_key_held() && $.get(active_tab) !== 'entry') $$render(consequent_1);
					});
				}

				var span_3 = $.sibling(node_5, 2);
				var node_7 = $.child(span_3);

				{
					let $0 = $.derived(() => $fieldTypes().find((f) => f.id === $.get(field).type)?.icon);

					Icon(node_7, {
						get icon() {
							return $.get($0);
						}
					});
				}

				var node_8 = $.sibling(node_7, 2);

				{
					var consequent_2 = ($$anchor) => {
						var span_4 = root_1();

						$.append($$anchor, span_4);
					};

					var alternate = ($$anchor) => {
						var span_5 = root_2();

						$.append($$anchor, span_5);
					};

					$.if(node_8, ($$render) => {
						if ($.get(field).type === 'repeater') $$render(consequent_2); else $$render(alternate, -1);
					});
				}

				$.reset(span_3);
				$.reset(button_1);
				$.reset(div_2);

				$.template_effect(() => {
					$.set_attribute(button, 'title', $mod_key_held() ? 'Set all fields to Field tab' : '');

					classes = $.set_class(button, 1, 'svelte-fzf0fs', null, classes, {
						active: $.get(active_tab) === 'field',
						showing_key_hint: $mod_key_held() && $.get(active_tab) !== 'field'
					});

					classes_1 = $.set_class(button_1, 1, 'border-t border-(--color-gray-9) svelte-fzf0fs', null, classes_1, {
						active: $.get(active_tab) === 'entry',
						showing_key_hint: $mod_key_held() && $.get(active_tab) !== 'entry'
					});

					$.set_attribute(button_1, 'title', $mod_key_held() ? 'Set all fields to Entry tab' : '');
				});

				$.delegated('dblclick', button, () => set_all_tabs('field'));

				$.delegated('click', button, () => {
					if ($mod_key_held()) {
						set_all_tabs('field');
					} else {
						if ($.get(active_tab) !== 'field') select_tab($.get(field).id, 'field');
					}
				});

				$.delegated('dblclick', button_1, () => set_all_tabs('entry'));

				$.delegated('click', button_1, () => {
					if ($mod_key_held()) {
						set_all_tabs('entry');
					} else {
						if ($.get(active_tab) !== 'entry') select_tab($.get(field).id, 'entry');
					}
				});

				$.append($$anchor, div_2);
			};

			$.if(node_1, ($$render) => {
				if ($current_user()?.siteRole === 'developer') $$render(consequent_3);
			});
		}

		var div_3 = $.sibling(node_1, 2);
		var node_9 = $.child(div_3);

		{
			var consequent_4 = ($$anchor) => {
				var div_4 = root_4();
				var node_10 = $.child(div_4);

				FieldItem(node_10, {
					get field() {
						return $.get(field);
					},

					get fields() {
						return $$props.fields;
					},

					get create_field() {
						return $$props.create_field;
					},
					onchange: handle_change,
					ondelete: handle_delete_field,
					onduplicate: () => {
						duplicate_field($.get(field));
					},

					onmove: (id, direction) => {
						const field_to_move = $$props.fields.find((f) => f.id === id);

						if (field_to_move) {
							move_field(field_to_move, direction);
						}
					}
				});

				$.reset(div_4);
				$.append($$anchor, div_4);
			};

			var consequent_5 = ($$anchor) => {
				EntryContent($$anchor, {
					get entity() {
						return $$props.entity;
					},

					get field() {
						return $.get(field);
					},

					get fields() {
						return $$props.fields;
					},

					get entries() {
						return $$props.entries;
					},
					level: 0,
					get onchange() {
						return $$props.oninput;
					},
					ondelete: handle_delete_entry
				});
			};

			$.if(node_9, ($$render) => {
				if ($.get(active_tab) === 'field') $$render(consequent_4); else if ($.get(active_tab) === 'entry') $$render(consequent_5, 1);
			});
		}

		$.reset(div_3);
		$.reset(div_1);
		$.append($$anchor, div_1);
	});

	var node_11 = $.sibling(node, 2);

	{
		var consequent_6 = ($$anchor) => {
			var button_2 = root_6();
			var node_12 = $.child(button_2);

			Icon(node_12, { icon: 'fa-solid:plus' });
			$.next(2);
			$.reset(button_2);
			$.delegated('click', button_2, () => $$props.create_field());
			$.append($$anchor, button_2);
		};

		$.if(node_11, ($$render) => {
			if ($current_user()?.siteRole === 'developer') $$render(consequent_6);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['dblclick', 'click']);