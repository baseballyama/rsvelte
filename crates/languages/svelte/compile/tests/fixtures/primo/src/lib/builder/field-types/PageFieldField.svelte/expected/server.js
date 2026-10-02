import * as $ from 'svelte/internal/server';
import { fieldTypes } from '../stores/app';
import { PageTypeEntries, PageTypeFields, PageTypes } from '$lib/pocketbase/collections';
import { PageEntries } from '$lib/pocketbase/collections';
import { setFieldEntries } from '../components/Fields/FieldsContent.svelte';
import { page_context, page_type_context } from '$lib/builder/stores/context';

export default function PageFieldField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { field, entry, onchange, level } = $$props;

		// Resolve the actual page field being referenced
		const resolvedField = $.derived(() => {
			if (!field.config?.field) return null;

			return PageTypeFields.one(field.config.field);
		});

		// Get the field type for the resolved field
		const fieldType = $.derived(() => {
			if (!resolvedField()) return null;

			return $.store_get($$store_subs ??= {}, '$fieldTypes', fieldTypes).find((ft) => ft.id === resolvedField().type);
		});

		const { value: page_type } = page_type_context.getOr({ value: null });
		const page_type_fields = $.derived(() => page_type?.fields());
		const page_type_entries = $.derived(() => page_type?.entries());
		const { value: page } = page_context.getOr({ value: null });
		const page_page_type = $.derived(() => page && PageTypes.one(page.page_type));
		const page_fields = $.derived(() => page_page_type()?.fields());
		const page_entries = $.derived(() => page?.entries());
		const entity = $.derived(() => page ?? page_type);
		const fields = $.derived(() => page_fields() ?? page_type_fields() ?? []);
		const entries = $.derived(() => page_entries() ?? page_type_entries() ?? []);
		const EntriesCollection = $.derived(() => page ? PageEntries : PageTypeEntries);

		// Handle changes to the page field by updating the entry
		function handleFieldChange(values) {
			setFieldEntries({
				fields: fields(),
				entries: entries(),
				updateEntry: EntriesCollection().update,
				createEntry: (data) => {
					if (page) {
						return PageEntries.create({ ...data, page: page.id });
					} else {
						return PageTypeEntries.create(data);
					}
				},
				values
			});

			onchange({});
		}

		function deleteEntryRelatedRecords(entry_id) {
			// Delete all sub-entries.
			for (const entry of entries()) {
				if (entry.parent === entry_id) {
					deleteEntryRelatedRecords(entry.id);
					EntriesCollection().delete(entry.id);
				}
			}
		}

		function handleDeleteEntry(entry_id) {
			deleteEntryRelatedRecords(entry_id);
			EntriesCollection().delete(entry_id);
		}

		if (entity() && resolvedField() && fieldType()) {
			$$renderer.push('<!--[0-->');

			const SvelteComponent = fieldType().component;

			if (SvelteComponent) {
				$$renderer.push('<!--[-->');

				SvelteComponent($$renderer, {
					entity: entity(),
					field: { ...resolvedField(), label: field.label },
					entry,
					fields: fields(),
					entries: entries(),
					onchange: handleFieldChange,
					ondelete: handleDeleteEntry,
					level
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else if (!field.config?.field) {
			$$renderer.push(`<!--[1--><span>Please configure this field to select a page field.</span>`);
		} else if (!entry) {
			$$renderer.push(`<!--[2--><span>No value found for this page field.</span>`);
		} else {
			$$renderer.push(`<!--[-1--><span>This field has been deleted or disconnected.</span>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}