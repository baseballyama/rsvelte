import * as $ from 'svelte/internal/server';
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

export default function FieldsContent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			entity,
			fields,
			entries,
			create_field,
			oninput,
			onchange,
			ondelete,
			ondelete_entry
		} = $$props;

		// TABS - Simple persistent approach
		let selected_tabs = $.store_get($$store_subs ??= {}, '$field_tabs_by_entity', field_tabs_by_entity)?.[entity?.id] || {};

		// Track field IDs to detect newly created fields
		const current_field_ids = () => (fields || []).filter((f) => !f.parent || f.parent === '').map((f) => f.id);

		let previous_field_ids = current_field_ids();

		// Initialize tabs for new fields when they appear, using an explicit watch
		watch(current_field_ids, (parent_field_ids) => {
			let changed = false;

			for (const id of parent_field_ids) {
				if (!(id in selected_tabs)) {
					// If this is a newly created field (not in previous list), show field tab
					// Otherwise, show entry tab by default for existing fields
					const is_new_field = !previous_field_ids.includes(id);

					selected_tabs[id] = is_new_field && $.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer' ? 'field' : 'entry';
					changed = true;
				}
			}

			previous_field_ids = [...parent_field_ids];

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
			const entity_id = entity?.id;

			if (!entity_id) return;

			const current = $.store_get($$store_subs ??= {}, '$field_tabs_by_entity', field_tabs_by_entity)?.[entity_id] || {};

			if (!_.isEqual(current, selected_tabs)) {
				$.store_set(field_tabs_by_entity, {
					...$.store_get($$store_subs ??= {}, '$field_tabs_by_entity', field_tabs_by_entity),
					[entity_id]: { ...selected_tabs }
				});
			}
		}

		// Field reordering function
		function move_field(field, direction) {
			// Get all top-level fields (same parent level as the field being moved)
			const siblings = fields.filter((f) => (f.parent || '') === (field.parent || ''));

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
			onchange({
				id: field.id,
				data: { index: field_to_swap.index || new_index }
			});

			onchange({ id: field_to_swap.id, data: { index: temp_index } });
		}

		function duplicate_field(field) {
			create_field(field);
		}

		function delete_field_related_records(field_id) {
			// Delete sub-fields
			for (const field of fields) {
				if (field.parent === field_id) {
					delete_field_related_records(field.id);
					ondelete(field);
				}
			}

			// Delete all entries attached to the field.
			for (const entry of entries) {
				if (entry.field === field_id) {
					delete_entry_related_records(entry.id);
					ondelete_entry(entry.id);
				}
			}
		}

		function delete_entry_related_records(entry_id) {
			// Delete all sub-entries.
			for (const entry of entries) {
				if (entry.parent === entry_id) {
					delete_entry_related_records(entry.id);
					ondelete_entry(entry.id);
				}
			}
		}

		function handle_change(details) {
			if ('type' in details.data) {
				// Changing field type.
				delete_field_related_records(details.id);
			}

			onchange(details);
		}

		function handle_delete_field(field) {
			delete_field_related_records(field.id);
			ondelete(field);
		}

		function handle_delete_entry(entry_id) {
			delete_entry_related_records(entry_id);
			ondelete_entry(entry_id);
		}

		$$renderer.push(`<div class="Fields svelte-fzf0fs"><!--[-->`);

		const each_array = $.ensure_array_like((fields || []).filter((f) => !f.parent || f.parent === '').sort((a, b) => a.index - b.index));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let field = each_array[$$index];
			const active_tab = selected_tabs[field.id] ?? 'entry';

			$$renderer.push(`<div class="entries-item svelte-fzf0fs">`);

			if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
				$$renderer.push(`<!--[0--><div class="top-tabs svelte-fzf0fs"><button data-test-id="field"${$.attr('title', $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) ? 'Set all fields to Field tab' : '')}${$.attr_class('svelte-fzf0fs', void 0, {
					'active': active_tab === 'field',
					'showing_key_hint': $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && active_tab !== 'field'
				})}>`);

				if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && active_tab !== 'field') {
					$$renderer.push(`<!--[0--><span class="key-hint svelte-fzf0fs"><span>⌘</span> `);
					Icon($$renderer, { icon: 'fa6-solid:hand-pointer' });
					$$renderer.push(`<!----></span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <span class="tab-content svelte-fzf0fs">`);
				Icon($$renderer, { icon: 'fluent:form-48-filled' });

				$$renderer.push(`<!----> <span>Field</span></span></button> <button data-test-id="entry"${$.attr_class('border-t border-(--color-gray-9) svelte-fzf0fs', void 0, {
					'active': active_tab === 'entry',
					'showing_key_hint': $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && active_tab !== 'entry'
				})}${$.attr('title', $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) ? 'Set all fields to Entry tab' : '')}>`);

				if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && active_tab !== 'entry') {
					$$renderer.push(`<!--[0--><span class="key-hint svelte-fzf0fs"><span>⌘</span> `);
					Icon($$renderer, { icon: 'fa6-solid:hand-pointer' });
					$$renderer.push(`<!----></span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <span class="tab-content svelte-fzf0fs">`);

				Icon($$renderer, {
					icon: $.store_get($$store_subs ??= {}, '$fieldTypes', fieldTypes).find((f) => f.id === field.type)?.icon
				});

				$$renderer.push(`<!----> `);

				if (field.type === 'repeater') {
					$$renderer.push(`<!--[0--><span>Entries</span>`);
				} else {
					$$renderer.push(`<!--[-1--><span>Entry</span>`);
				}

				$$renderer.push(`<!--]--></span></button></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="container svelte-fzf0fs">`);

			if (active_tab === 'field') {
				$$renderer.push(`<!--[0--><div class="FieldItem">`);

				FieldItem($$renderer, {
					field,
					fields,
					create_field,
					onchange: handle_change,
					ondelete: handle_delete_field,
					onduplicate: () => {
						duplicate_field(field);
					},

					onmove: (id, direction) => {
						const field_to_move = fields.find((f) => f.id === id);

						if (field_to_move) {
							move_field(field_to_move, direction);
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			} else if (active_tab === 'entry') {
				$$renderer.push('<!--[1-->');

				EntryContent($$renderer, {
					entity,
					field,
					fields,
					entries,
					level: 0,
					onchange: oninput,
					ondelete: handle_delete_entry
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--> `);

		if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
			$$renderer.push(`<!--[0--><button class="field-button svelte-fzf0fs">`);
			Icon($$renderer, { icon: 'fa-solid:plus' });
			$$renderer.push(`<!----> <span>Create Field</span></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}