import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import { site_context } from '$lib/builder/stores/context';
import UI from '../../ui/index.js';
import { watch } from 'runed';
import { fieldTypes } from '../../stores/app';

var root = $.from_html(`<div class="PageFieldField"><div class="container svelte-1nirip9"><!></div></div>`);

export default function SiteFieldField($$anchor, $$props) {
	$.push($$props, true);

	const $fieldTypes = () => $.store_get(fieldTypes, '$fieldTypes', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { value: site } = site_context.getOr({ value: null });
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
		return $.get(siteFields).filter((sf) => !sf.parent).map((sf) => {
			const ft = $fieldTypes().find((t) => t.id === sf.type);

			return {
				id: sf.id,
				label: sf.label || sf.key,
				value: sf.id,
				icon: ft?.icon
			};
		});
	});

	// auto-select first option (wait for field_list to populate)
	let autofilled = $.state(false);

	watch(() => $.get(field_list), () => {
		const first_option = $.get(field_list)[0];

		if ($.get(field_list).length === 0 || $$props.field.config?.field || $.get(autofilled)) return;

		dispatch('input', {
			label: first_option.label,
			key: validate_field_key(first_option.label),
			config: { ...$$props.field.config, field: first_option.id }
		});

		$.set(autofilled, true);
	});

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $$props.field.config?.field || ($.get(field_list).length > 0 ? $.get(field_list)[0].id : ''));

		let $1 = $.derived(() => Array.isArray($.get(field_list))
			? $.get(field_list).map((f) => ({ label: f.label, value: f.id, icon: f.icon }))
			: []);

		$.component(node, () => UI.Select, ($$anchor, UI_Select) => {
			UI_Select($$anchor, {
				fullwidth: true,
				label: 'Site Content',
				get value() {
					return $.get($0);
				},

				get options() {
					return $.get($1);
				},

				$$events: {
					input: ({ detail }) => {
						dispatch('input', { config: { ...$$props.field.config, field: detail } });
					}
				}
			});
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}