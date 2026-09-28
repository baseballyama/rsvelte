import * as $ from 'svelte/internal/server';
import EntryContent from './Fields/EntryContent.svelte';
import { current_user } from '$lib/pocketbase/user';

export default function Content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { entity, fields, entries, oninput, ondelete } = $$props;

		function delete_entry_related_records(entry_id) {
			// Delete all sub-entries.
			for (const entry of entries) {
				if (entry.parent === entry_id) {
					delete_entry_related_records(entry.id);
					ondelete(entry.id);
				}
			}
		}

		function handle_delete_entry(entry_id) {
			delete_entry_related_records(entry_id);
			ondelete(entry_id);
		}

		$$renderer.push(`<div class="Content svelte-aei9lh">`);

		const each_array = $.ensure_array_like(fields.filter((f) => !f.parent || f.parent === '').sort((a, b) => (a.index || 0) - (b.index || 0)));

		if (each_array.length !== 0) {
			$$renderer.push('<!--[-->');

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let field = each_array[$$index];

				EntryContent($$renderer, {
					entity,
					field,
					fields,
					entries,
					level: 0,
					onchange: oninput,
					ondelete: handle_delete_entry
				});
			}
		} else {
			$$renderer.push(`<!--[!--><p class="empty-description svelte-aei9lh">`);

			if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
				$$renderer.push(`<!--[0-->When you create fields, they'll be editable from here`);
			} else {
				$$renderer.push(`<!--[-1-->When the site developer creates fields, they'll be editable from here`);
			}

			$$renderer.push(`<!--]--></p>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}