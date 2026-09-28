import * as $ from 'svelte/internal/server';
import { find as _find, chain as _chain } from 'lodash-es';
import Icon from '@iconify/svelte';
import { fieldTypes } from '../stores/app';
import EntryContent from '../components/Fields/EntryContent.svelte';

export default function GroupField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			entity,
			field,
			entry,
			fields,
			entries,
			onchange,
			ondelete,
			level
		} = $$props;

		const group_entry = $.derived(() => entry);
		const subfields = $.derived(() => fields.filter((f) => f.parent === field.id).sort((a, b) => a.index - b.index));
		let hidden = false;

		$$renderer.push(`<div${$.attr_class(`group-field group-level-${$.stringify(level)}`, 'svelte-1flpwt3')}>`);

		if (level > 0) {
			$$renderer.push(`<!--[0--><button class="svelte-1flpwt3"><span class="svelte-1flpwt3">${$.escape(field.label)}</span> `);
			Icon($$renderer, { icon: hidden ? 'ph:caret-up-bold' : 'ph:caret-down-bold' });
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (!hidden) {
			$$renderer.push(`<!--[0--><div class="group-entries svelte-1flpwt3">`);

			if (subfields().length === 0) {
				$$renderer.push(`<!--[0--><div class="no-subfields"><span>No subfields in this group. Add subfields in the Field tab.</span></div>`);
			} else {
				$$renderer.push(`<!--[-1--><!--[-->`);

				const each_array = $.ensure_array_like(subfields());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let subfield = each_array[$$index];

					EntryContent($$renderer, {
						entity,
						parent: group_entry(),
						field: subfield,
						fields,
						entries,
						level: level + 1,
						minimal: true,
						onchange: (values) => onchange({ [field.key]: { 0: { value: null, subValues: values } } }),
						ondelete
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}