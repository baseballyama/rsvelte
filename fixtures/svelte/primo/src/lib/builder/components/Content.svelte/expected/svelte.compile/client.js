import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import EntryContent from './Fields/EntryContent.svelte';
import { current_user } from '$lib/pocketbase/user';

var root = $.from_html(`<p class="empty-description svelte-aei9lh"><!></p>`);
var root_1 = $.from_html(`<div class="Content svelte-aei9lh"></div>`);

export default function Content($$anchor, $$props) {
	$.push($$props, true);

	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function delete_entry_related_records(entry_id) {
		// Delete all sub-entries.
		for (const entry of $$props.entries) {
			if (entry.parent === entry_id) {
				delete_entry_related_records(entry.id);
				$$props.ondelete(entry.id);
			}
		}
	}

	function handle_delete_entry(entry_id) {
		delete_entry_related_records(entry_id);
		$$props.ondelete(entry_id);
	}

	var div = root_1();

	$.each(
		div,
		21,
		() => $$props.fields.filter((f) => !f.parent || f.parent === '').sort((a, b) => (a.index || 0) - (b.index || 0)),
		(field) => field.id,
		($$anchor, field) => {
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
		},
		($$anchor) => {
			var p = root();
			var node = $.child(p);

			{
				var consequent = ($$anchor) => {
					var text = $.text('When you create fields, they\'ll be editable from here');

					$.append($$anchor, text);
				};

				var alternate = ($$anchor) => {
					var text_1 = $.text('When the site developer creates fields, they\'ll be editable from here');

					$.append($$anchor, text_1);
				};

				$.if(node, ($$render) => {
					if ($current_user()?.siteRole === 'developer') $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(p);
			$.append($$anchor, p);
		}
	);

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}