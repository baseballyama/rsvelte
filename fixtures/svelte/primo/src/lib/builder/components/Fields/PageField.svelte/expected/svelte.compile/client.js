import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import { site_context, page_type_context } from '$lib/builder/stores/context';
import UI from '../../ui/index.js';

var root = $.from_html(`<div class="PagesField"><div class="container svelte-4c7rsl"><!></div></div>`);

export default function PageField($$anchor, $$props) {
	$.push($$props, true);

	const { value: site } = site_context.getOr({ value: null });
	const { value: current_page_type } = page_type_context.getOr({ value: null });
	const dispatch = createEventDispatcher();

	const pageTypes = $.derived(() => {
		const types = site?.page_types() || [];
		const typesArray = Array.isArray(types) ? types : [];

		// Filter out current page type to prevent circular dependencies
		return typesArray.filter((type) => type.id !== current_page_type?.id);
	});

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $$props.field.config?.page_type || '');

		let $1 = $.derived(() => $.get(pageTypes).map((page_type) => ({
			label: page_type.name,
			value: page_type.id,
			icon: page_type.icon
		})));

		$.component(node, () => UI.Select, ($$anchor, UI_Select) => {
			UI_Select($$anchor, {
				label: 'Page Type',
				get value() {
					return $.get($0);
				},
				fullwidth: true,
				get options() {
					return $.get($1);
				},

				$$events: {
					input: ({ detail }) => {
						dispatch('input', { config: { ...$$props.field.config, page_type: detail } });
					}
				}
			});
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}