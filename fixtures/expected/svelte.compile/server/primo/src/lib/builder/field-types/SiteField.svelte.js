import * as $ from 'svelte/internal/server';
import { fieldTypes } from '../stores/app';
import { SiteFields, SiteEntries } from '$lib/pocketbase/collections';
import { setFieldEntries } from '../components/Fields/FieldsContent.svelte';
import { site_context } from '$lib/builder/stores/context';

export default function SiteField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { entity, field, entry, onchange, level } = $$props;

		// Resolve the actual site field being referenced
		const resolvedField = $.derived(() => {
			if (!field.config?.field) return null;

			return SiteFields.one(field.config.field);
		});

		// Get the field type for the resolved field
		const fieldType = $.derived(() => {
			if (!resolvedField()) return null;

			return $.store_get($$store_subs ??= {}, '$fieldTypes', fieldTypes).find((ft) => ft.id === resolvedField().type);
		});

		const { value: site } = site_context.getOr({ value: null });
		const fields = $.derived(() => site?.fields() ?? []);
		const entries = $.derived(() => site?.entries() ?? []);

		// Handle changes to the site field by updating the entry
		function handleFieldChange(values) {
			setFieldEntries({
				fields: fields(),
				entries: entries(),
				updateEntry: SiteEntries.update,
				createEntry: SiteEntries.create,
				values
			});

			onchange({});
		}

		function deleteEntryRelatedRecords(entry_id) {
			// Delete all sub-entries.
			for (const entry of entries()) {
				if (entry.parent === entry_id) {
					deleteEntryRelatedRecords(entry.id);
					SiteEntries.delete(entry.id);
				}
			}
		}

		function handleDeleteEntry(entry_id) {
			deleteEntryRelatedRecords(entry_id);
			SiteEntries.delete(entry_id);
		}

		if (site && resolvedField() && fieldType()) {
			$$renderer.push('<!--[0-->');

			const SvelteComponent = fieldType().component;

			if (SvelteComponent) {
				$$renderer.push('<!--[-->');

				SvelteComponent($$renderer, {
					entity: site,
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
			$$renderer.push(`<!--[1--><span>Please configure this field to select a site field.</span>`);
		} else if (!entry) {
			$$renderer.push(`<!--[2--><span>No value found for this site field.</span>`);
		} else {
			$$renderer.push(`<!--[-1--><span>This field has been deleted or disconnected.</span>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}