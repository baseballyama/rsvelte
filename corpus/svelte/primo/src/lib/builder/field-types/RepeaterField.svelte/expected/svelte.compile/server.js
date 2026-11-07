import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';
import { onDestroy } from 'svelte';
import RepeaterFieldItem from './RepeaterFieldItem.svelte';
import * as idb from 'idb-keyval';
import pluralize from 'pluralize';
import { get_empty_value } from '../utils';

export default function RepeaterField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			entity,
			field,
			fields,
			entries,
			onchange,
			ondelete,
			level,
			parent
		} = $$props;

		let repeater_entries = $.derived(() => entries?.filter((r) => r.field === field.id && (parent ? r.parent === parent.id : !r.parent)).sort((a, b) => a.index - b.index));
		let subfields = $.derived(() => fields?.filter((f) => f.parent === field.id).sort((a, b) => a.index - b.index));
		let repeater_item_just_created = null; // to autofocus on creation

		function add_item() {
			repeater_item_just_created = 0;

			for (const entry of repeater_entries()) {
				if (entry.index >= repeater_item_just_created) {
					repeater_item_just_created = entry.index + 1;
				}
			}

			onchange({
				[field.key]: {
					[repeater_item_just_created]: {
						value: null,
						subValues: Object.fromEntries(subfields().map((subfield) => [subfield.key, { 0: { value: get_empty_value(subfield) } }]))
					}
				}
			});

			visibleRepeaters[`${field.key}-${repeater_item_just_created}`] = true;
		}

		let visibleRepeaters = {};

		idb.get(field.id).then((res) => {
			if (res) {
				visibleRepeaters = res;
			}
		});

		onDestroy(() => {
			// save visible repeaters
			idb.set(field.id, { ...visibleRepeaters });
		});

		// TODO: Handle these
		let show_label = false;

		let hover_index = null;
		let hover_position = null;

		$$renderer.push(`<div${$.attr_class(`RepeaterField repeater-level-${$.stringify(level)}`, 'svelte-rnwm7y')}>`);

		if (show_label) {
			$$renderer.push(`<!--[0--><p class="primo--field-label">${$.escape(field.label)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <ul class="fields svelte-rnwm7y"><!--[-->`);

		const each_array = $.ensure_array_like(repeater_entries());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let entry = each_array[$$index];
			const index = entry.index;
			const subfield_id = `${field.key}-${index}`;
			const autofocus = index === repeater_item_just_created;
			const hovering = hover_index === index;

			$$renderer.push(`<li>`);

			RepeaterFieldItem($$renderer, {
				entity,
				field,
				entry,
				index,
				fields,
				subfields: subfields(),
				entries,
				level,
				autofocus,
				onchange,
				ondelete,
				is_visible: visibleRepeaters[subfield_id],
				hovering,
				hover_position
			});

			$$renderer.push(`<!----></li>`);
		}

		$$renderer.push(`<!--]--></ul> <button class="field-button svelte-rnwm7y">`);
		Icon($$renderer, { icon: 'akar-icons:plus' });
		$$renderer.push(`<!----> <span>Create ${$.escape(pluralize.singular(field.label))}</span></button></div>`);
	});
}