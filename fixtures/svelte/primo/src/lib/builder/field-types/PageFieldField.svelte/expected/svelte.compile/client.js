import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fieldTypes } from '../stores/app';
import { PageTypeEntries, PageTypeFields, PageTypes } from '$lib/pocketbase/collections';
import { PageEntries } from '$lib/pocketbase/collections';
import { setFieldEntries } from '../components/Fields/FieldsContent.svelte';
import { page_context, page_type_context } from '$lib/builder/stores/context';

var root = $.from_html(`<span>Please configure this field to select a page field.</span>`);
var root_1 = $.from_html(`<span>No value found for this page field.</span>`);
var root_2 = $.from_html(`<span>This field has been deleted or disconnected.</span>`);

export default function PageFieldField($$anchor, $$props) {
	$.push($$props, true);

	const $fieldTypes = () => $.store_get(fieldTypes, '$fieldTypes', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// Resolve the actual page field being referenced
	const resolvedField = $.derived(() => {
		if (!$$props.field.config?.field) return null;

		return PageTypeFields.one($$props.field.config.field);
	});

	// Get the field type for the resolved field
	const fieldType = $.derived(() => {
		if (!$.get(resolvedField)) return null;

		return $fieldTypes().find((ft) => ft.id === $.get(resolvedField).type);
	});

	const { value: page_type } = page_type_context.getOr({ value: null });
	const page_type_fields = $.derived(() => page_type?.fields());
	const page_type_entries = $.derived(() => page_type?.entries());
	const { value: page } = page_context.getOr({ value: null });
	const page_page_type = $.derived(() => page && PageTypes.one(page.page_type));
	const page_fields = $.derived(() => $.get(page_page_type)?.fields());
	const page_entries = $.derived(() => page?.entries());
	const entity = $.derived(() => page ?? page_type);
	const fields = $.derived(() => $.get(page_fields) ?? $.get(page_type_fields) ?? []);
	const entries = $.derived(() => $.get(page_entries) ?? $.get(page_type_entries) ?? []);
	const EntriesCollection = $.derived(() => page ? PageEntries : PageTypeEntries);

	// Handle changes to the page field by updating the entry
	function handleFieldChange(values) {
		setFieldEntries({
			fields: $.get(fields),
			entries: $.get(entries),
			updateEntry: $.get(EntriesCollection).update,
			createEntry: (data) => {
				if (page) {
					return PageEntries.create({ ...data, page: page.id });
				} else {
					return PageTypeEntries.create(data);
				}
			},
			values
		});

		$$props.onchange({});
	}

	function deleteEntryRelatedRecords(entry_id) {
		// Delete all sub-entries.
		for (const entry of $.get(entries)) {
			if (entry.parent === entry_id) {
				deleteEntryRelatedRecords(entry.id);
				$.get(EntriesCollection).delete(entry.id);
			}
		}
	}

	function handleDeleteEntry(entry_id) {
		deleteEntryRelatedRecords(entry_id);
		$.get(EntriesCollection).delete(entry_id);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const SvelteComponent = $.derived(() => $.get(fieldType).component);
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ ...$.get(resolvedField), label: $$props.field.label }));

				$.component(node_1, () => $.get(SvelteComponent), ($$anchor, SvelteComponent_1) => {
					SvelteComponent_1($$anchor, {
						get entity() {
							return $.get(entity);
						},

						get field() {
							return $.get($0);
						},

						get entry() {
							return $$props.entry;
						},

						get fields() {
							return $.get(fields);
						},

						get entries() {
							return $.get(entries);
						},
						onchange: handleFieldChange,
						ondelete: handleDeleteEntry,
						get level() {
							return $$props.level;
						}
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		var consequent_1 = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		var consequent_2 = ($$anchor) => {
			var span_1 = root_1();

			$.append($$anchor, span_1);
		};

		var alternate = ($$anchor) => {
			var span_2 = root_2();

			$.append($$anchor, span_2);
		};

		$.if(node, ($$render) => {
			if ($.get(entity) && $.get(resolvedField) && $.get(fieldType)) $$render(consequent); else if (!$$props.field.config?.field) $$render(consequent_1, 1); else if (!$$props.entry) $$render(consequent_2, 2); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}