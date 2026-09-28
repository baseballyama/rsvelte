import * as $ from 'svelte/internal/server';
import Card from '$lib/builder/ui/Card.svelte';
import { useContent, useEntries } from '$lib/Content.svelte';
import { fieldTypes } from '../../stores/app/index.js';
import Icon from '@iconify/svelte';
import { EyeOff } from 'lucide-svelte';
import { current_user } from '$lib/pocketbase/user';
import { locale } from '../../stores/app/misc';
import { page_context, page_type_context } from '$lib/builder/stores/context';
import { PageTypes, PageTypeFields } from '$lib/pocketbase/collections';

export default function EntryContent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			entity,
			parent,
			field,
			fields,
			entries,
			level,
			onchange,
			ondelete,
			minimal
		} = $$props;

		const field_type = $.derived(() => $.store_get($$store_subs ??= {}, '$fieldTypes', fieldTypes).find((ft) => ft.id === field.type));
		const Field_Component = $.derived(() => field_type()?.component);
		const _data = $.derived(() => useContent(entity, { target: 'cms' }));
		const data = $.derived(() => _data() && (_data()[$.store_get($$store_subs ??= {}, '$locale', locale)] ?? {}));

		// Page Field relevance: hide Entry UI for content editors if the selected page field
		// does not belong to the active page type's field list.
		const { value: page_ctx } = page_context.getOr({ value: null });

		const { value: page_type_ctx } = page_type_context.getOr({ value: null });

		const active_page_type = $.derived(() => {
			if (page_type_ctx) return page_type_ctx;
			if (page_ctx) return PageTypes.one(page_ctx.page_type);

			return null;
		});

		const selected_page_field = $.derived(() => field.type === 'page-field' && field.config?.field ? PageTypeFields.one(field.config.field) : null);
		const selected_page_type_page_type = $.derived(() => selected_page_field() ? PageTypes.one(selected_page_field().page_type) : null);

		const is_page_field_irrelevant = $.derived(() => {
			if (field.type !== 'page-field') return false;
			if (!selected_page_field()) return false;
			if (!active_page_type()) return false;

			return selected_page_field().page_type !== active_page_type().id;
		});

		const is_visible = $.derived(() => {
			// No condition set → visible
			if (!field.config?.condition) return true;

			const { field: field_to_check, value: expected, comparison } = field.config.condition;

			// Find the field this condition depends on (limited to same entity and, if applicable, same parent)
			const comparable_field = fields.find((f) => f.id === field_to_check);

			if (!comparable_field) return true; // if missing, fail open

			// Prefer live entries (respecting parent nesting) so visibility reacts immediately to edits
			const [comparable_entry] = useEntries(entity, comparable_field, parent) ?? [];

			const comparable_value = comparable_entry?.value ?? data()?.[comparable_field.key];

			if (comparison === '=' && expected === comparable_value) return true;
			if (comparison === '!=' && expected !== comparable_value) return true;

			return false;
		});

		if (!Field_Component()) {
			$$renderer.push(`<!--[0--><span>Field type for the field is not found!</span>`);
		} else if (field.type === 'page-field' && is_page_field_irrelevant()) {
			$$renderer.push('<!--[1-->');

			if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
				$$renderer.push(`<!--[0--><div class="hidden-field svelte-1fa7dtb">`);
				EyeOff($$renderer, { size: '14' });
				$$renderer.push(`<!----> <span><strong>${$.escape(field.label)}</strong> isn't available on this page type and is hidden from content editors.</span></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else if (is_visible()) {
			$$renderer.push('<!--[2-->');

			const [entry] = useEntries(entity, field, parent) ?? [];
			const title = ['repeater', 'group'].includes(field.type) ? field.label : null;
			const icon = undefined;

			if (field.type === 'site-field' || field.type === 'page-field') {
				$$renderer.push(`<!--[0--><div class="dynamic-header svelte-1fa7dtb">`);

				if (field.type === 'site-field') {
					$$renderer.push('<!--[0-->');
					Icon($$renderer, { icon: 'gg:website' });
					$$renderer.push(`<!----> <span>Site Field</span>`);
				} else if (field.type === 'page-field') {
					$$renderer.push('<!--[1-->');
					Icon($$renderer, { icon: selected_page_type_page_type()?.icon || 'iconoir:page' });
					$$renderer.push(`<!----> <span>Page Field</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Card($$renderer, {
				title,
				icon,
				minimal,
				children: ($$renderer) => {
					if (Field_Component()) {
						$$renderer.push('<!--[-->');

						Field_Component()($$renderer, {
							entity,
							field,
							fields,
							entries,
							entry,
							level,
							onchange,
							ondelete,
							parent
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		} else if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer' && !is_visible()) {
			$$renderer.push('<!--[3-->');
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}