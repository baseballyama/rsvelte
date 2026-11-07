import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import { site_context } from '$lib/builder/stores/context';
import UI from '../../ui/index.js';
import { watch } from 'runed';
import { fieldTypes } from '../../stores/app';

export default function SiteFieldField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { value: site } = site_context.getOr({ value: null });
		let { field } = $$props;
		const dispatch = createEventDispatcher();

		function validate_field_key(key) {
			// replace dash and space with underscore
			return key.replace(/-/g, '_').replace(/ /g, '_').toLowerCase();
		}

		// Get site fields for the current site
		const siteFields = $.derived(() => {
			const list = site?.fields();

			return Array.isArray(list) ? list : [];
		});

		let field_list = $.derived(() => {
			return siteFields().filter((sf) => !sf.parent).map((sf) => {
				const ft = $.store_get($$store_subs ??= {}, '$fieldTypes', fieldTypes).find((t) => t.id === sf.type);

				return {
					id: sf.id,
					label: sf.label || sf.key,
					value: sf.id,
					icon: ft?.icon
				};
			});
		});

		// auto-select first option (wait for field_list to populate)
		let autofilled = false;

		watch(() => field_list(), () => {
			const first_option = field_list()[0];

			if (field_list().length === 0 || field.config?.field || autofilled) return;

			dispatch('input', {
				label: first_option.label,
				key: validate_field_key(first_option.label),
				config: { ...field.config, field: first_option.id }
			});

			autofilled = true;
		});

		$$renderer.push(`<div class="PageFieldField"><div class="container svelte-1nirip9">`);

		if (UI.Select) {
			$$renderer.push('<!--[-->');

			UI.Select($$renderer, {
				fullwidth: true,
				label: 'Site Content',
				value: field.config?.field || (field_list().length > 0 ? field_list()[0].id : ''),
				options: Array.isArray(field_list())
					? field_list().map((f) => ({ label: f.label, value: f.id, icon: f.icon }))
					: []
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}